export const DEFAULT_REMOTE_CONFIG = {
    hostname: 'core.waldo.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',
};

export const LOCAL_REMOTE_CONFIG = {
    ...DEFAULT_REMOTE_CONFIG,
    hostname: 'localhost',
    port: 3035,
};
