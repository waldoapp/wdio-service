import { describe, it, vi, expect, afterEach } from 'vitest';
import memfs from 'memfs';
import { loadWaldoProfile } from './waldoProfile.js';
import { waldoDir, writeTestProfile } from '../__test__/waldoProfileUtils.js';

vi.mock('node:fs', async () => {
    return memfs.fs;
});

describe('loadWaldoProfile', () => {
    afterEach(() => {
        memfs.vol.reset();
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
        await writeTestProfile('x:\n💩');
        expect(loadWaldoProfile).rejects.toThrow();
    });

    it('load expected profile key', async () => {
        await writeTestProfile('user_token: some_token');
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({ user_token: 'some_token' });
    });

    it('load other profile key', async () => {
        await writeTestProfile('other: value');
        const profile = await loadWaldoProfile();
        expect(profile).toEqual({ other: 'value' });
    });
});
