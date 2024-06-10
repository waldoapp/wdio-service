import { PRODUCTION_CONNECTION } from './configuration/waldoEnvironment.js';

export function getRemoteBaseUrl(browser: WebdriverIO.Browser) {
    const protocol = browser.options.protocol ?? 'http';
    const hostname = browser.options.hostname ?? PRODUCTION_CONNECTION.hostname;
    const port = browser.options.port ?? PRODUCTION_CONNECTION.port;
    return `${protocol}://${hostname}:${port}`;
}

export function getWdUrl(browser: WebdriverIO.Browser, path: string) {
    return `${getRemoteBaseUrl(browser)}${browser.options.path ?? '/'}${path}`;
}
