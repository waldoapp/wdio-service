import * as fs from 'fs';
import { homedir } from 'os';
import { parse as parseYaml } from 'yaml';
import { isNodeError } from '../utils.js';

export type WaldoProfileYaml = {
    user_token?: string;
};

const waldoProfileFile = `${homedir()}/.waldo/profile.yml`;

export async function loadWaldoProfile(): Promise<WaldoProfileYaml> {
    try {
        const ymlContent = await fs.promises.readFile(waldoProfileFile, 'utf-8');
        return parseYaml(ymlContent);
    } catch (error: unknown) {
        // File not existing is expected - any other error is not
        if (isNodeError(error) && error.code === 'ENOENT') {
            return {};
        }

        throw error;
    }
}
