import type { Services, Capabilities, Options } from '@wdio/types';

import { getEnvironmentConnectionOptions } from './configuration/waldoEnvironment.js';
import { type Configuration, loadConfiguration } from './configuration/configuration.js';
import type { WaldoServiceOptions, CapabilitiesWithWaldo } from './types.js';

import logger from '@wdio/logger';

const log = logger('@waldoapp/wdio-service');

export class WaldoWdioLauncherService implements Services.ServiceInstance {
    private serviceOptions: WaldoServiceOptions;

    private configuration: Configuration | undefined;

    constructor(serviceOptions: WaldoServiceOptions) {
        this.serviceOptions = serviceOptions;
    }

    async onPrepare(
        config: Options.Testrunner,
        capabilities: Capabilities.RemoteCapabilities,
    ): Promise<void> {
        this.configuration = await loadConfiguration();
        this.configureRemoteInAllCapabilities(config, capabilities, this.configuration);
    }

    private configureRemoteInAllCapabilities(
        config: Options.Testrunner,
        capabilities: Capabilities.RemoteCapabilities,
        configuration: Configuration,
    ) {
        if (Array.isArray(capabilities)) {
            for (const cap of capabilities) {
                const alwaysMatch = 'alwaysMatch' in cap ? cap.alwaysMatch : cap;
                this.checkCapabilities(config, alwaysMatch, configuration);
                this.overrideRemoteInCapabilities(alwaysMatch);
            }
        } else if (typeof capabilities === 'object' && capabilities !== null) {
            for (const cap of Object.values(capabilities)) {
                this.checkCapabilities(config, cap, configuration);
                this.overrideRemoteInCapabilities(cap);
            }
        }

        this.overrideRemoteInCapabilities(config);
    }

    private checkCapabilities(
        testRunnerOptions: Options.Testrunner,
        capabilities: CapabilitiesWithWaldo,
        configuration: Configuration,
    ) {
        capabilities['waldo:options'] = capabilities['waldo:options'] ?? {};

        capabilities['appium:app'] =
            capabilities['appium:app'] ?? this.serviceOptions.versionId ?? configuration.versionId;

        const waldoOptions = capabilities['waldo:options'];
        waldoOptions.token =
            waldoOptions.token ??
            this.serviceOptions.token ??
            capabilities.key ??
            testRunnerOptions.key ??
            configuration.token;
        waldoOptions.sessionId =
            waldoOptions.sessionId ?? this.serviceOptions.sessionId ?? configuration.sessionId;
        waldoOptions.waitSessionReady =
            waldoOptions.waitSessionReady ?? this.serviceOptions.waitSessionReady;
        waldoOptions.showSession =
            waldoOptions.showSession ??
            this.serviceOptions.showSession ??
            configuration.showSession;

        const hasVersionInformation =
            typeof capabilities['appium:app'] === 'string' ||
            typeof waldoOptions.sessionId === 'string';
        if (!hasVersionInformation) {
            throw new Error(
                'Missing version information in appium:app or session information in waldo:options.sessionId capabilities',
            );
        }
    }

    private overrideRemoteInCapabilities(capabilities: Options.Connection): void {
        const environment =
            this.serviceOptions.environment ?? this.configuration?.environment ?? 'production';

        log.debug(`Connecting to Waldo ${environment} environment`);

        const remoteConfig = getEnvironmentConnectionOptions(environment);

        capabilities.hostname = remoteConfig.hostname;
        capabilities.port = remoteConfig.port;
        capabilities.protocol = remoteConfig.protocol;
        capabilities.path = remoteConfig.path;
    }
}
