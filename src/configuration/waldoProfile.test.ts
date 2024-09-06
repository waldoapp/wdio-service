import { describe, it, vi, expect } from 'vitest';
import memfs from 'memfs';
import { homedir } from 'node:os';
import { afterEach } from 'node:test';
import { loadWaldoProfile } from './waldoProfile.js';
import path from 'node:path';

vi.mock('node:fs', async () => {
    return memfs.fs;
});

const waldoDir = path.join(homedir(), '.waldo');
const filePath = path.join(waldoDir, 'profile.yml');

async function writeProfile(content: string) {
    await memfs.fs.promises.mkdir(waldoDir, { recursive: true });
    await memfs.fs.promises.writeFile(filePath, content);
}

describe('loadWaldoProfile', () => {
    afterEach(() => {
        memfs.fs.reset();
    });

    it('handle missing dir', async () => {
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({});
    });

    it('handle missing file', async () => {
        await memfs.fs.promises.mkdir(waldoDir, { recursive: true });
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({});
    });

    it('throw on invalid YAML', async () => {
        await writeProfile('x:\n💩');
        expect(loadWaldoProfile).rejects.toThrow();
    });

    it('load expected profile key', async () => {
        await writeProfile('user_token: some_token');
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({ user_token: 'some_token' });
    });

    it('load other profile key', async () => {
        await writeProfile('other: value');
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({ other: 'value' });
    });
});
