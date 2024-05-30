/* eslint-disable class-methods-use-this */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import type { Services } from '@wdio/types';

import { addDriverCommands } from './commands.js';
import { waitForSessionReady } from './utils.js';
import type { CapabilitiesWithWaldo, WaldoRemoteCapability } from './types.js';

const execP = promisify(exec);

export class WaldoWdioService implements Services.ServiceInstance {
  constructor(options: any) {
    console.log('WaldoWdioService constructor', options);
  }

  async before(
    capabilities: CapabilitiesWithWaldo,
    _specs: string[],
    browser: WebdriverIO.Browser,
  ): Promise<void> {
    // Add Waldo specific logic to the driver
    addDriverCommands(browser);

    const { replayUrl } = browser.capabilities as WaldoRemoteCapability;
    console.log(`View live session: ${replayUrl}`);

    const waldoOptions = capabilities['waldo:options'] ?? {};

    // Open Waldo session in browser if not in interactive mode
    if (waldoOptions.showSession && !waldoOptions.sessionId) {
      await execP(`open "${replayUrl}"`);
    }

    if (waldoOptions.waitSessionReady) {
      await waitForSessionReady(browser.sessionId);
    }
  }
}
