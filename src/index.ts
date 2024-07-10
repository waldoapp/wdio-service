import { WaldoWdioService } from './service.js';
import { WaldoWdioLauncherService } from './launcher.js';
import type { WaldoBrowser, WaldoCapabilities, WaldoServiceOptions } from './types.js';

export default WaldoWdioService;
export const launcher = WaldoWdioLauncherService;

export type * from './types.js';

declare global {
    namespace WebdriverIO {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ServiceOption extends WaldoServiceOptions {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Capabilities extends WaldoCapabilities {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Browser extends WaldoBrowser {}
    }
}
