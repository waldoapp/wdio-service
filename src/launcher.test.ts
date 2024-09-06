import { afterEach, describe, it, vi, expect } from 'vitest';
import type { Capabilities, Options } from '@wdio/types';
import memfs from 'memfs';

import { WaldoWdioLauncherService } from './launcher.js';
import { PRODUCTION_CONNECTION, STAGING_CONNECTION } from './configuration/waldoEnvironment.js';
import { writeTestProfile } from './__tests__/waldoProfileUtils.js';

vi.mock('node:fs', () => {
    return memfs.fs;
});

describe('onPrepare', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        memfs.vol.reset();
    });

    it('defaults are as expected for array of capabilities', async () => {
        const service = new WaldoWdioLauncherService({});
        const remoteCapabilities: Capabilities.RemoteCapabilities = [
            { 'appium:app': 'appv-12345' },
        ];
        const config: Options.Testrunner = { capabilities: {} };
        await service.onPrepare(config, remoteCapabilities);
        expect(remoteCapabilities).toEqual([
            { 'appium:app': 'appv-12345', ...PRODUCTION_CONNECTION, 'waldo:options': {} },
        ]);
        expect(config).toEqual({ capabilities: {}, ...PRODUCTION_CONNECTION });
    });

    it('defaults are as expected for alwaysMatch', async () => {
        const service = new WaldoWdioLauncherService({});
        const remoteCapabilities: Capabilities.RemoteCapabilities = [
            {
                alwaysMatch: { 'appium:app': 'appv-12345' },
                firstMatch: [{ platformName: 'macos' }, { platformName: 'linux' }],
            },
        ];
        const config: Options.Testrunner = { capabilities: {} };
        await service.onPrepare(config, remoteCapabilities);
        expect(remoteCapabilities).toEqual([
            {
                alwaysMatch: {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
                firstMatch: [{ platformName: 'macos' }, { platformName: 'linux' }],
            },
        ]);
        expect(config).toEqual({ capabilities: {}, ...PRODUCTION_CONNECTION });
    });

    describe('waldo environment', () => {
        it('can be specified as an option', async () => {
            const service = new WaldoWdioLauncherService({ environment: 'staging' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345' },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                { 'appium:app': 'appv-12345', ...STAGING_CONNECTION, 'waldo:options': {} },
            ]);
            expect(config).toEqual({ capabilities: {}, ...STAGING_CONNECTION });
        });

        it('can be specified in env', async () => {
            vi.stubEnv('WALDO_ENVIRONMENT', 'staging');
            const service = new WaldoWdioLauncherService({ environment: 'production' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345' },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                { 'appium:app': 'appv-12345', ...STAGING_CONNECTION, 'waldo:options': {} },
            ]);
            expect(config).toEqual({ capabilities: {}, ...STAGING_CONNECTION });
        });
    });

    describe('waldo token', () => {
        it('can be specified in waldo profile', async () => {
            await writeTestProfile('user_token: profile-token');
            const service = new WaldoWdioLauncherService({});
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345' },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'profile-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                ...PRODUCTION_CONNECTION,
            });
        });

        it("can be specified in runner options 'key'", async () => {
            await writeTestProfile('user_token: profile-token');

            const service = new WaldoWdioLauncherService({});
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345' },
            ];
            const config: Options.Testrunner = { capabilities: {}, key: 'runner-token' };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'runner-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                key: 'runner-token',
                ...PRODUCTION_CONNECTION,
            });
        });

        it("can be specified in service options 'token'", async () => {
            await writeTestProfile('user_token: profile-token');

            const service = new WaldoWdioLauncherService({ token: 'service-token' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345' },
            ];
            const config: Options.Testrunner = { capabilities: {}, key: 'runner-token' };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'service-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                key: 'runner-token',
                ...PRODUCTION_CONNECTION,
            });
        });

        it("can be specified in capabilities 'key'", async () => {
            await writeTestProfile('user_token: profile-token');

            const service = new WaldoWdioLauncherService({ token: 'service-token' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'appv-12345', key: 'cap-key-token' },
            ];
            const config: Options.Testrunner = { capabilities: {}, key: 'runner-token' };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'cap-key-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                key: 'runner-token',
                ...PRODUCTION_CONNECTION,
            });
        });

        it("can be specified in capabilities waldo:options 'token'", async () => {
            await writeTestProfile('user_token: profile-token');

            const service = new WaldoWdioLauncherService({ token: 'service-token' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                {
                    'appium:app': 'appv-12345',
                    key: 'cap-key-token',
                    'waldo:options': { token: 'cap-waldo-token' },
                },
            ];
            const config: Options.Testrunner = { capabilities: {}, key: 'runner-token' };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'cap-waldo-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                key: 'runner-token',
                ...PRODUCTION_CONNECTION,
            });
        });

        it('can be specified in env', async () => {
            await writeTestProfile('user_token: profile-token');

            vi.stubEnv('WALDO_TOKEN', 'env-token');
            const service = new WaldoWdioLauncherService({ token: 'service-token' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                {
                    'appium:app': 'appv-12345',
                    key: 'cap-key-token',
                    'waldo:options': { token: 'cap-waldo-token' },
                },
            ];
            const config: Options.Testrunner = { capabilities: {}, key: 'runner-token' };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'appv-12345',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {
                        token: 'env-token',
                    },
                },
            ]);
            expect(config).toEqual({
                capabilities: {},
                key: 'runner-token',
                ...PRODUCTION_CONNECTION,
            });
        });
    });

    describe('app version', () => {
        it("can be specified in service options 'versionId'", async () => {
            const service = new WaldoWdioLauncherService({ versionId: 'service-versionId' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [{}];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'service-versionId',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
            ]);
        });

        it("can be specified in capabilities 'appium:app'", async () => {
            const service = new WaldoWdioLauncherService({ versionId: 'service-versionId' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                { 'appium:app': 'cap-appium-versionId' },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'cap-appium-versionId',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
            ]);
        });

        it("can be specified in capabilities waldo:options 'versionId'", async () => {
            const service = new WaldoWdioLauncherService({ versionId: 'service-versionId' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                {
                    'appium:app': 'cap-appium-versionId',
                    'waldo:options': { versionId: 'cap-waldo-versionId' },
                },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'cap-waldo-versionId',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
            ]);
        });

        it("can be specified in env 'VERSION_ID'", async () => {
            vi.stubEnv('VERSION_ID', 'env-versionId');
            const service = new WaldoWdioLauncherService({ versionId: 'service-versionId' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                {
                    'appium:app': 'cap-appium-versionId',
                    'waldo:options': { versionId: 'cap-waldo-versionId' },
                },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'env-versionId',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
            ]);
        });

        it("can be specified in env 'WALDO_APP_VERSION_ID'", async () => {
            vi.stubEnv('VERSION_ID', 'env-versionId');
            vi.stubEnv('WALDO_APP_VERSION_ID', 'env-waldo-app-versionId');
            const service = new WaldoWdioLauncherService({ versionId: 'service-versionId' });
            const remoteCapabilities: Capabilities.RemoteCapabilities = [
                {
                    'appium:app': 'cap-appium-versionId',
                    'waldo:options': { versionId: 'cap-waldo-versionId' },
                },
            ];
            const config: Options.Testrunner = { capabilities: {} };
            await service.onPrepare(config, remoteCapabilities);
            expect(remoteCapabilities).toEqual([
                {
                    'appium:app': 'env-waldo-app-versionId',
                    ...PRODUCTION_CONNECTION,
                    'waldo:options': {},
                },
            ]);
        });
    });
});
