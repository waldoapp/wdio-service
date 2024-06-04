import { getLocalDevFromEnvironment } from './config.js';
import { DEFAULT_REMOTE_CONFIG, LOCAL_REMOTE_CONFIG } from './constants.js';

const remoteConfig = getLocalDevFromEnvironment() ? LOCAL_REMOTE_CONFIG : DEFAULT_REMOTE_CONFIG;

export function getRemoteBaseUrl() {
    return `${remoteConfig.protocol}://${remoteConfig.hostname}:${remoteConfig.port}`;
}

export function getWdUrl(path: string) {
    return `${getRemoteBaseUrl()}${remoteConfig.path ?? '/'}${path}`;
}
