import memfs from 'memfs';
import { homedir } from 'node:os';
import path from 'node:path';

export const waldoDir = path.join(homedir(), '.waldo');
export const filePath = path.join(waldoDir, 'profile.yml');

export async function writeTestProfile(content: string) {
    await memfs.fs.promises.mkdir(waldoDir, { recursive: true });
    await memfs.fs.promises.writeFile(filePath, content);
}
