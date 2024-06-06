import type { Options } from '@wdio/types';
import type { WaldoEnvironment } from '../types.js';

export type EnvironmentConnection = {
    readonly hostname: NonNullable<Options.Connection['hostname']>;
    readonly port: NonNullable<Options.Connection['port']>;
    readonly protocol: NonNullable<Options.Connection['protocol']>;
    readonly path: NonNullable<Options.Connection['path']>;
};

export const DEFAULT_REMOTE_CONFIG: EnvironmentConnection = {
    hostname: 'core.waldo.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',
};

export const STAGING_REMOTE_CONFIG: EnvironmentConnection = {
    ...DEFAULT_REMOTE_CONFIG,
    hostname: 'core-staging.waldo.io',
};

export const LOCAL_REMOTE_CONFIG: EnvironmentConnection = {
    ...DEFAULT_REMOTE_CONFIG,
    hostname: 'localhost',
    port: 3035,
};

export function parseEnvironment(value: string | undefined): WaldoEnvironment | undefined {
    switch (value) {
        case 'production':
        case 'staging':
        case 'development':
            return value;
        default:
            return undefined;
    }
}

export function getEnvironmentConnectionOptions(
    environment: WaldoEnvironment | undefined,
): EnvironmentConnection {
    switch (environment) {
        case 'staging':
            return STAGING_REMOTE_CONFIG;
        case 'development':
            return LOCAL_REMOTE_CONFIG;
        default:
            return DEFAULT_REMOTE_CONFIG;
    }
}
