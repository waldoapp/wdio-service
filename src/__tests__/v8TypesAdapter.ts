import type { Options } from '@wdio/types';

/** Adapter to allow capabilities field for tests that should be compatible between WebDriverIO v8 and v9 */
export type TestRunnerOptionsForTests = Options.Testrunner & { capabilities?: object };
