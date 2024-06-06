import {
    type ProcessEnvironmentConfiguration,
    getProcessEnvironmentConfiguration,
} from './processEnvironment.js';
import { loadWaldoProfile } from './waldoProfile.js';

export type Configuration = ProcessEnvironmentConfiguration;

export async function loadConfiguration(): Promise<Configuration> {
    const envConfig = getProcessEnvironmentConfiguration();
    const profileConfig = await loadWaldoProfile();

    return {
        ...envConfig,
        token: envConfig.token ?? profileConfig.user_token,
    };
}
