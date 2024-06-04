/* eslint-disable class-methods-use-this */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import type { Services } from '@wdio/types';

import { addDriverCommands } from './commands.js';
import { waitForSessionReady } from './utils.js';
import type { CapabilitiesWithWaldo, WaldoRemoteCapability } from './types.js';
import { Test, TestResult } from '@wdio/types/build/Frameworks.js';

const execP = promisify(exec);

declare var driver: WebdriverIO.Browser;

export class WaldoWdioService implements Services.ServiceInstance {
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

    async beforeTest(test: Test) {
        await driver.log(`Starting test "${test.title}"`, { file: test.file });
    }

    async afterTest(test: Test, _context: any, testResult: TestResult) {
        const { error, result, duration, passed } = testResult;
        if (passed) {
            await driver.log(
                `Test "${test.title}": Success in ${duration}ms`,
                { file: test.file },
                'info',
            );
        } else {
            await driver.log(
                `Test "${test.title}": Failed: ${error} (${duration}ms)`,
                {
                    file: test.file,
                    error: String(error?.message),
                    result,
                },
                'error',
            );
        }
    }

    afterSession() {
        const { replayUrl } = driver.capabilities as WaldoRemoteCapability;
        console.log(`\n\nWaldo Session link: ${replayUrl}\n\n`);
    }
}
