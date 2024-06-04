import * as process from 'process';
import * as fs from 'fs';
import { homedir } from 'os';

import { parse as parseYaml } from 'yaml';

type EnvironmentConfiguration = {
    localDev: boolean | undefined;
    token: string | undefined;
    sessionId: string | undefined;
    versionId: string | undefined;
    showSession: boolean | undefined;
};

function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    return value === '1' || value.toLowerCase() === 'true';
}

export function getLocalDevFromEnvironment(): boolean {
    return parseBoolean(process.env.WALDO_LOCAL_DEV) ?? false;
}

function getEnvironmentConfiguration(): EnvironmentConfiguration {
    const { env } = process;

    return {
        localDev: parseBoolean(env.WALDO_LOCAL_DEV),
        token: env.WALDO_API_TOKEN ?? env.WALDO_TOKEN ?? process.env.TOKEN,
        sessionId: env.WALDO_SESSION_ID ?? env.SESSION_ID,
        versionId: env.WALDO_APP_VERSION_ID ?? env.VERSION_ID,
        showSession: parseBoolean(env.WALDO_SHOW_SESSION) ?? parseBoolean(env.SHOW_SESSION),
    };
}

type WaldoProfileYaml = {
    user_token?: string;
};

async function loadWaldoProfile(): Promise<WaldoProfileYaml> {
    const waldoProfileFile = `${homedir()}/.waldo/profile.yml`;
    try {
        const ymlContent = await fs.promises.readFile(waldoProfileFile, 'utf-8');
        return parseYaml(ymlContent);
    } catch (error: any) {
        // File not existing is expected - any other error is not
        if (error.code !== 'ENOENT') {
            throw error;
        }

        return {};
    }
}

export type Configuration = EnvironmentConfiguration;

export async function loadConfiguration(): Promise<Configuration> {
    const envConfig = getEnvironmentConfiguration();
    const profileConfig = await loadWaldoProfile();

    return {
        ...envConfig,
        token: envConfig.token ?? profileConfig.user_token,
    };
}
