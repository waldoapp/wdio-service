import { afterEach, describe, it, vi, expect } from 'vitest';
import { getProcessEnvironmentConfiguration } from './processEnvironment.js';

describe('getProcessEnvironmentConfiguration', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('has the expected defaults', () => {
        const conf = getProcessEnvironmentConfiguration();
        expect(conf).toStrictEqual({
            environment: undefined,
            token: undefined,
            sessionId: undefined,
            versionId: undefined,
            showSession: undefined,
        });
    });

    it.each([
        ['production', 'production'],
        ['development', 'development'],
        ['staging', 'staging'],
        [undefined, undefined],
        ['', undefined],
        ['other', undefined],
    ])('read WALDO_ENVIRONMENT %o -> %o', (value, expected) => {
        vi.stubEnv(
            'WALDO_ENVIRONMENT',
            /* The types in vitest don't allow undefined */
            value as string,
        );
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.environment).toEqual(expected);
    });

    it('read TOKEN', () => {
        vi.stubEnv('TOKEN', 'test-token');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.token).toEqual('test-token');
    });

    it('read WALDO_TOKEN and ignore TOKEN', () => {
        vi.stubEnv('TOKEN', 'test-token');
        vi.stubEnv('WALDO_TOKEN', 'waldo-test-token');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.token).toEqual('waldo-test-token');
    });

    it('read WALDO_API_TOKEN and ignore TOKEN and WALDO_TOKEN', () => {
        vi.stubEnv('TOKEN', 'test-token');
        vi.stubEnv('WALDO_TOKEN', 'waldo-test-token');
        vi.stubEnv('WALDO_API_TOKEN', 'waldo-api-test-token');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.token).toEqual('waldo-api-test-token');
    });

    it('read SESSION_ID', () => {
        vi.stubEnv('SESSION_ID', 'test-session-id');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.sessionId).toEqual('test-session-id');
    });

    it('read WALDO_SESSION_ID and ignore SESSION_ID', () => {
        vi.stubEnv('SESSION_ID', 'test-session-id');
        vi.stubEnv('WALDO_SESSION_ID', 'test-waldo-session-id');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.sessionId).toEqual('test-waldo-session-id');
    });

    it('read VERSION_ID', () => {
        vi.stubEnv('VERSION_ID', 'test-version-id');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.versionId).toEqual('test-version-id');
    });

    it('read WALDO_SESSION_ID and ignore VERSION_ID', () => {
        vi.stubEnv('VERSION_ID', 'test-version-id');
        vi.stubEnv('WALDO_APP_VERSION_ID', 'test-waldo-app-version-id');
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.versionId).toEqual('test-waldo-app-version-id');
    });

    it.each([
        ['true', true],
        ['TRUE', true],
        ['false', false],
        ['yes', true],
        ['no', false],
        ['1', true],
        ['0', false],
        ['other', undefined],
        [undefined, undefined],
    ])('read SHOW_SESSION %o -> %o', (value, expected) => {
        vi.stubEnv('SHOW_SESSION', value as string);
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.showSession).toEqual(expected);
    });

    it.each([
        ['true', true],
        ['TRUE', true],
        ['false', false],
        ['yes', true],
        ['no', false],
        ['1', true],
        ['0', false],
    ])('read WALDO_SHOW_SESSION and ignore SHOW_SESSION %o -> %o', (value, expected) => {
        vi.stubEnv('SHOW_SESSION', 'true');
        vi.stubEnv('WALDO_SHOW_SESSION', value);
        const conf = getProcessEnvironmentConfiguration();
        expect(conf.showSession).toEqual(expected);
    });

    it.each(['other', undefined])(
        'ignore invalid WALDO_SHOW_SESSION and use SHOW_SESSION %o',
        (value) => {
            vi.stubEnv('SHOW_SESSION', 'true');
            vi.stubEnv('WALDO_SHOW_SESSION', value as string);
            const conf = getProcessEnvironmentConfiguration();
            expect(conf.showSession).toEqual(true);
        },
    );
});
