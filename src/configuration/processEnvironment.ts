import * as process from 'process';

import type { WaldoEnvironment } from '../types.js';
import { parseEnvironment } from './waldoEnvironment.js';

export type ProcessEnvironmentConfiguration = {
    readonly environment: WaldoEnvironment | undefined;
    readonly token: string | undefined;
    readonly sessionId: string | undefined;
    readonly versionId: string | undefined;
    readonly showSession: boolean | undefined;
};

function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    return value === '1' || value.toLowerCase() === 'true';
}

export function getProcessEnvironmentConfiguration(): ProcessEnvironmentConfiguration {
    const { env } = process;

    return {
        environment: parseEnvironment(env.WALDO_ENVIRONMENT),
        token: env.WALDO_API_TOKEN ?? env.WALDO_TOKEN ?? process.env.TOKEN,
        sessionId: env.WALDO_SESSION_ID ?? env.SESSION_ID,
        versionId: env.WALDO_APP_VERSION_ID ?? env.VERSION_ID,
        showSession: parseBoolean(env.WALDO_SHOW_SESSION) ?? parseBoolean(env.SHOW_SESSION),
    };
}
