import * as fs from 'fs';
import { homedir } from 'os';
import { parse as parseYaml } from 'yaml';

export type WaldoProfileYaml = {
    user_token?: string;
};

export async function loadWaldoProfile(): Promise<WaldoProfileYaml> {
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
