import open from 'open';

import logger from '@wdio/logger';
import type { Services, Frameworks } from '@wdio/types';

import { addDriverCommands } from './commands.js';
import { waitForSessionReady } from './utils.js';
import type { CapabilitiesWithWaldo, WaldoRemoteCapability } from './types.js';

const log = logger('@waldoapp/wdio-service');

declare const driver: WebdriverIO.Browser;

export class WaldoWdioService implements Services.ServiceInstance {
    async before(
        capabilities: CapabilitiesWithWaldo,
        _specs: string[],
        browser: WebdriverIO.Browser,
    ): Promise<void> {
        // Add Waldo specific logic to the driver
        addDriverCommands(browser);

        const { replayUrl } = browser.capabilities as WaldoRemoteCapability;
        log.info(`View live session: ${replayUrl}`);

        const waldoOptions = capabilities['waldo:options'] ?? {};

        // Open Waldo session in browser if not in interactive mode
        if (waldoOptions.showSession && !waldoOptions.sessionId) {
            if (replayUrl?.startsWith('http://') || replayUrl?.startsWith('https://')) {
                void open(replayUrl);
            }
        }

        if (waldoOptions.waitSessionReady !== false) {
            await waitForSessionReady(browser);
        }
    }

    async beforeTest(test: Frameworks.Test) {
        await driver.log(`Starting test "${test.title}"`, { file: test.file });
    }

    async afterTest(test: Frameworks.Test, _context: any, testResult: Frameworks.TestResult) {
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
                    error:
                        typeof error === 'object' && 'message' in error
                            ? String(error.message)
                            : '',
                    result,
                },
                'error',
            );
        }
    }

    afterSession() {
        if (!driver.capabilities) {
            return;
        }

        const { replayUrl } = driver.capabilities as WaldoRemoteCapability;
        if (!replayUrl) {
            return;
        }

        log.info(`Waldo Session link: ${replayUrl}`);
    }
}
