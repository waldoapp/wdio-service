/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { Services, Capabilities, Options } from '@wdio/types';

import {
    LOCAL_REMOTE_CONFIG,
    DEFAULT_REMOTE_CONFIG,
    getEnvironmentConnectionOptions,
} from './configuration/waldoEnvironment.js';
import { type Configuration, loadConfiguration } from './configuration/configuration.js';
import type { WaldoServiceOptions, CapabilitiesWithWaldo } from './types.js';

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

    private async configureRemoteInAllCapabilities(
        config: Options.Testrunner,
        capabilities: Capabilities.RemoteCapabilities,
        configuration: Configuration,
    ) {
        if (Array.isArray(capabilities)) {
            for (const cap of capabilities) {
                const alwaysMatch = 'alwaysMatch' in cap ? cap.alwaysMatch : cap;
                this.checkCapabilities(config, alwaysMatch, configuration);
                await this.overrideRemoteInCapabilities(alwaysMatch);
            }
        } else if (typeof capabilities === 'object' && capabilities !== null) {
            for (const cap of Object.values(capabilities)) {
                this.checkCapabilities(config, cap, configuration);
                await this.overrideRemoteInCapabilities(cap);
            }
        }

        await this.overrideRemoteInCapabilities(config);
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
        waldoOptions.waldoMode = waldoOptions.waldoMode ?? this.serviceOptions.waldoMode;
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

    private async overrideRemoteInCapabilities(capabilities: Options.Connection): Promise<void> {
        const remoteConfig = getEnvironmentConnectionOptions(
            this.serviceOptions.environment ?? this.configuration?.environment,
        );

        /* eslint-disable no-param-reassign */
        capabilities.hostname = remoteConfig.hostname;
        capabilities.port = remoteConfig.port;
        capabilities.protocol = remoteConfig.protocol;
        capabilities.path = remoteConfig.path;
        /* eslint-enable no-param-reassign */
    }
}
