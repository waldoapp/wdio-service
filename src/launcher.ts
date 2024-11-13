import type { Services, Options } from '@wdio/types';

import { getEnvironmentConnectionOptions } from './configuration/waldoEnvironment.js';
import type {
    WaldoServiceOptions,
    CapabilitiesWithWaldo,
    TestrunnerCapabilities,
} from './types.js';

import logger from '@wdio/logger';
import {
    getProcessEnvironmentConfiguration,
    ProcessEnvironmentConfiguration,
} from './configuration/processEnvironment.js';
import { loadWaldoProfile, WaldoProfileYaml } from './configuration/waldoProfile.js';

const log = logger('@waldoapp/wdio-service');

export class WaldoWdioLauncherService implements Services.ServiceInstance {
    private serviceOptions: WaldoServiceOptions;
    private processEnvConfig: ProcessEnvironmentConfiguration;
    private waldoProfile: WaldoProfileYaml | undefined;

    constructor(serviceOptions: WaldoServiceOptions) {
        this.serviceOptions = serviceOptions;
        this.processEnvConfig = getProcessEnvironmentConfiguration();
    }

    async onPrepare(
        config: Options.Testrunner,
        capabilities: TestrunnerCapabilities,
    ): Promise<void> {
        this.waldoProfile = await loadWaldoProfile();
        this.configureRemoteInAllCapabilities(config, capabilities);
    }

    private configureRemoteInAllCapabilities(
        config: Options.Testrunner,
        capabilities: TestrunnerCapabilities,
    ) {
        if (Array.isArray(capabilities)) {
            for (const cap of capabilities) {
                const alwaysMatch = 'alwaysMatch' in cap ? cap.alwaysMatch : cap;
                this.checkCapabilities(config, alwaysMatch);
                this.overrideRemoteInCapabilities(alwaysMatch);
            }
        } else if (typeof capabilities === 'object' && capabilities !== null) {
            for (const cap of Object.values(capabilities)) {
                this.checkCapabilities(config, cap);
                this.overrideRemoteInCapabilities(cap);
            }
        }

        this.overrideRemoteInCapabilities(config);
    }

    private checkCapabilities(
        testRunnerOptions: Options.Testrunner,
        capabilities: CapabilitiesWithWaldo,
    ) {
        capabilities['waldo:options'] = capabilities['waldo:options'] ?? {};
        const waldoOptions = capabilities['waldo:options'];

        // Priority order:
        // 1. processEnvConfig: Environment variable
        // 2. waldoOptions: Waldo specific capabilities (First in waldo:option then prefixed at root)
        // 3. capabilities: Global / appium capabilities
        // 4. serviceOptions: Service option (Passed to the constructor)
        // 5. testRunnerOptions: Test runner option (key, port, hostname, ...)
        // 6. waldoProfile: User-local profile (e.g. ~/.waldo/profile.yml, only for token)
        // 7. Default value

        const { processEnvConfig, serviceOptions, waldoProfile } = this;

        capabilities['appium:app'] =
            processEnvConfig?.versionId ??
            waldoOptions.versionId ??
            capabilities['waldo:versionId'] ??
            capabilities['appium:app'] ??
            serviceOptions.versionId;
        delete waldoOptions.versionId;
        delete capabilities['waldo:versionId'];

        waldoOptions.token =
            processEnvConfig.token ??
            waldoOptions.token ??
            capabilities['waldo:token'] ??
            capabilities.key ??
            serviceOptions.token ??
            testRunnerOptions.key ??
            waldoProfile?.user_token;
        delete capabilities.key;
        delete capabilities['waldo:token'];

        waldoOptions.sessionId =
            processEnvConfig.sessionId ??
            waldoOptions.sessionId ??
            capabilities['waldo:sessionId'] ??
            serviceOptions.sessionId;
        delete capabilities['waldo:sessionId'];

        waldoOptions.waitSessionReady =
            waldoOptions.waitSessionReady ??
            capabilities['waldo:waitSessionReady'] ??
            serviceOptions.waitSessionReady;
        delete capabilities['waldo:waitSessionReady'];

        waldoOptions.showSession =
            processEnvConfig.showSession ??
            waldoOptions.showSession ??
            capabilities['waldo:showSession'] ??
            serviceOptions.showSession;
        delete capabilities['waldo:showSession'];

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
            this.processEnvConfig?.environment ?? this.serviceOptions.environment ?? 'production';

        log.debug(`Connecting to Waldo ${environment} environment`);

        const remoteConfig = getEnvironmentConnectionOptions(environment);

        capabilities.hostname = remoteConfig.hostname;
        capabilities.port = remoteConfig.port;
        capabilities.protocol = remoteConfig.protocol;
        capabilities.path = remoteConfig.path;
    }
}
