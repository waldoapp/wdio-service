import { DEFAULT_REMOTE_CONFIG } from './configuration/waldoEnvironment.js';

export function getRemoteBaseUrl(browser: WebdriverIO.Browser) {
    const protocol = browser.options.protocol ?? 'http';
    const hostname = browser.options.hostname ?? DEFAULT_REMOTE_CONFIG.hostname;
    const port = browser.options.port ?? DEFAULT_REMOTE_CONFIG.port;
    return `${protocol}://${hostname}:${port}`;
}

export function getWdUrl(browser: WebdriverIO.Browser, path: string) {
    return `${getRemoteBaseUrl(browser)}${browser.options.path ?? '/'}${path}`;
}
