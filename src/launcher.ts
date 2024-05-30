/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import type { Services, Capabilities, Options } from '@wdio/types';
import type { Connection } from '@wdio/types/build/Options';

import {LOCAL_REMOTE_CONFIG, DEFAULT_REMOTE_CONFIG} from './constants.js';
import { type Configuration, loadConfiguration } from './config.js';
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
    this.configuration = await loadConfiguration(config);
    this.configureRemoteInAllCapabilities(config, capabilities, this.configuration);
  }

  private async configureRemoteInAllCapabilities(
    config: Options.Testrunner,
    capabilities: Capabilities.RemoteCapabilities,
    configuration: Configuration
  ) {
    if (Array.isArray(capabilities)) {
      for (const cap of capabilities) {
        const alwaysMatch = 'alwaysMatch' in cap ? cap.alwaysMatch : cap;
        this.checkCapabilities(alwaysMatch, configuration);
        await this.overrideRemoteInCapabilities(alwaysMatch, configuration);
      }
    } else if (typeof capabilities === 'object' && capabilities !== null) {
      for (const cap of Object.values(capabilities)) {
        this.checkCapabilities(cap, configuration);
        await this.overrideRemoteInCapabilities(cap, configuration);
      }
    }

    await this.overrideRemoteInCapabilities(config, configuration);
  }

  private checkCapabilities(capabilities: CapabilitiesWithWaldo, configuration: Configuration) {
    if (capabilities['waldo:options'] === undefined) {
        // eslint-disable-next-line no-param-reassign
        capabilities['waldo:options'] = {};
    }

    const waldoOptions = capabilities['waldo:options'];

    if (waldoOptions.token === undefined) {
        waldoOptions.token = configuration.token;
    }

    if (waldoOptions.sessionId === undefined) {
        waldoOptions.sessionId = configuration.sessionId;
    }

    if (capabilities['appium:app'] === undefined) {
        // eslint-disable-next-line no-param-reassign
        capabilities['appium:app'] = configuration.versionId;
    }

    if (waldoOptions.waitSessionReady === undefined && this.serviceOptions.waitSessionReady !== undefined) {
        waldoOptions.waitSessionReady = this.serviceOptions.waitSessionReady;
    }

    if (waldoOptions.waldoMode === undefined && this.serviceOptions.waldoMode !== undefined) {
        waldoOptions.waldoMode = this.serviceOptions.waldoMode;
    }

    if (waldoOptions.showSession === undefined && configuration.showSession !== undefined) {
        waldoOptions.showSession = configuration.showSession;
    }

    const hasVersionInformation = typeof capabilities['appium:app'] === 'string' || typeof waldoOptions.sessionId === 'string';
    if (!hasVersionInformation) {
      throw new Error('Missing version information in appium:app or session information in waldo:options.sessionId capabilities');
    }
  }

  private async overrideRemoteInCapabilities(
    capabilities: Connection,
    configuration: Configuration
  ): Promise<void> {
    const remoteConfig = configuration.localDev ? LOCAL_REMOTE_CONFIG : DEFAULT_REMOTE_CONFIG;

    /* eslint-disable no-param-reassign */
    capabilities.hostname = remoteConfig.hostname;
    capabilities.port = remoteConfig.port;
    capabilities.protocol = remoteConfig.protocol;
    capabilities.path = remoteConfig.path;
    /* eslint-enable no-param-reassign */
  }
}
