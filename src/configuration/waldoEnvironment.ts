import type { Options } from '@wdio/types';
import type { WaldoEnvironment } from '../types.js';

export type EnvironmentConnection = {
    readonly hostname: NonNullable<Options.Connection['hostname']>;
    readonly port: NonNullable<Options.Connection['port']>;
    readonly protocol: NonNullable<Options.Connection['protocol']>;
    readonly path: NonNullable<Options.Connection['path']>;
};

export const PRODUCTION_CONNECTION: EnvironmentConnection = {
    hostname: 'core.waldo.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',
};

export const STAGING_CONNECTION: EnvironmentConnection = {
    ...PRODUCTION_CONNECTION,
    hostname: 'core-staging.waldo.io',
};

export const DEVELOPMENT_CONNECTION: EnvironmentConnection = {
    ...PRODUCTION_CONNECTION,
    hostname: 'localhost',
    port: 3035,
    protocol: 'http',
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
            return STAGING_CONNECTION;
        case 'development':
            return DEVELOPMENT_CONNECTION;
        default:
            return PRODUCTION_CONNECTION;
    }
}
