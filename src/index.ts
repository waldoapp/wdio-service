import { WaldoWdioService } from './service.js';
import { WaldoWdioLauncherService } from './launcher.js';
import type { WaldoBrowser, WaldoCapabilities, WaldoServiceOptions } from './types.js';

export default WaldoWdioService;
export const launcher = WaldoWdioLauncherService;

export type * from './types.js';

declare global {
    namespace WebdriverIO {
        interface ServiceOption extends WaldoServiceOptions {}
        interface Capabilities extends WaldoCapabilities {}
        interface Browser extends WaldoBrowser {}
    }
}
