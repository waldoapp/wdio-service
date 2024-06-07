import * as fs from 'fs';
import { homedir } from 'os';
import { parse as parseYaml } from 'yaml';
import { isNodeError } from '../utils.js';

export type WaldoProfileYaml = {
    user_token?: string;
};

export async function loadWaldoProfile(): Promise<WaldoProfileYaml> {
    const waldoProfileFile = `${homedir()}/.waldo/profile.yml`;
    try {
        const ymlContent = await fs.promises.readFile(waldoProfileFile, 'utf-8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parseYaml(ymlContent);
    } catch (error: unknown) {
        // File not existing is expected - any other error is not
        if (isNodeError(error) && error.code !== 'ENOENT') {
            throw error;
        }

        return {};
    }
}
