/* eslint-disable @typescript-eslint/unbound-method */
import { afterEach, beforeEach, describe, it, vi, expect } from 'vitest';
import { first, last, performSwipe, swipeScreen, waitAsPromise, waitForElement } from './utils.js';
import { attach } from 'webdriverio';
import { ELEMENT_KEY } from 'webdriver';

vi.mock('axios');

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

const noSuchElementErrorObject = Object.freeze({
    error: 'no such element',
    message: 'An element could not be located on the page using the given search parameters.',
    stacktrace: '',
});

/**
 * Return a browser instance.
 * This is useful to take methods from it and use them as-is or modified on mocks.
 */
async function getSomeBrowserInstance() {
    const browser = await attach({
        options: {},
        sessionId: '123456',
        protocol: 'http',
        hostname: 'localhost',
        port: 12345,
        capabilities: {},
    });
    return browser;
}

describe('waitAsPromise', () => {
    it('wait as expected', async () => {
        let completed = false;
        const promise = waitAsPromise(1000).then(() => {
            completed = true;
        });
        vi.advanceTimersByTime(999);
        expect(completed).toEqual(false);
        vi.advanceTimersByTime(1);
        await promise;
        expect(completed).toEqual(true);
    });
});

async function getFakeBrowser(): Promise<WebdriverIO.Browser> {
    const someBrowser = await getSomeBrowserInstance();
    return {
        options: {
            protocol: 'http',
            hostname: 'localhost',
            port: 12345,
            waitforTimeout: 5000,
            waitforInterval: 500,
        },
        waitUntil: someBrowser.waitUntil,
    } satisfies Partial<WebdriverIO.Browser> as WebdriverIO.Browser;
}

describe('waitForElement', () => {
    it('works when the element is already present', async () => {
        const browser = await getFakeBrowser();
        browser.findElement = vi.fn(() => Promise.resolve({ [ELEMENT_KEY]: 'fake.element.id' }));
        const found = await waitForElement(browser, 'selector', 'value');
        expect(found['element-6066-11e4-a52e-4f735466cecf']).toEqual('fake.element.id');
    });

    it("fails when the element is not present (And the 'no such element' error is unhandled)", async () => {
        const browser = await getFakeBrowser();
        const noSuchElementError = new Error('Not found');
        noSuchElementError.name = 'no such element';
        browser.findElement = vi.fn(() => Promise.reject(noSuchElementError));
        let resolved = false;
        const foundPromise = waitForElement(browser, 'selector', 'value')
            .catch((e) => e)
            .finally(() => {
                resolved = true;
            });
        await vi.advanceTimersByTimeAsync(4999);
        expect(resolved).toEqual(false);
        await vi.advanceTimersByTimeAsync(1);
        expect(resolved).toEqual(true);
        const found = await foundPromise;
        expect(found).toBeInstanceOf(Error);
        expect(found.message).toMatch(/Could not find element with "selector"='value'/);
    });

    it("fails when the element is not present (And the 'no such element' error is handled)", async () => {
        const browser = await getFakeBrowser();
        browser.findElement = vi.fn(() => Promise.resolve(noSuchElementErrorObject as any));
        let resolved = false;
        const foundPromise = waitForElement(browser, 'selector', 'value')
            .catch((e) => e)
            .finally(() => {
                resolved = true;
            });
        await vi.advanceTimersByTimeAsync(4999);
        expect(resolved).toEqual(false);
        await vi.advanceTimersByTimeAsync(1);
        expect(resolved).toEqual(true);
        const found = await foundPromise;
        expect(found).toBeInstanceOf(Error);
        expect(found.message).toMatch(/Could not find element with "selector"='value'/);
    });

    it('works when the element is present after a delay', async () => {
        const browser = await getFakeBrowser();
        browser.findElement = vi.fn(() => Promise.resolve(noSuchElementErrorObject as any));
        let resolved = false;
        const foundPromise = waitForElement(browser, 'selector', 'value').finally(() => {
            resolved = true;
        });
        await vi.advanceTimersByTimeAsync(1000);
        browser.findElement = vi.fn(() => Promise.resolve({ [ELEMENT_KEY]: 'fake.element.id' }));
        await vi.advanceTimersByTimeAsync(500);
        expect(resolved).toEqual(true);
        const found = await foundPromise;
        expect(found['element-6066-11e4-a52e-4f735466cecf']).toEqual('fake.element.id');
    });
});

describe('performSwipe', () => {
    it('call performActions with the expected values', async () => {
        const browser = await getFakeBrowser();
        browser.performActions = vi.fn(() => Promise.resolve());
        await performSwipe(browser, 10, 10, 20, 10);
        expect(browser.performActions).toHaveBeenCalledTimes(1);
        expect(browser.performActions).toHaveBeenCalledWith([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', x: 10, y: 10, duration: 50 },
                    { type: 'pointerDown' },
                    { type: 'pause', duration: 600 },
                    { type: 'pointerMove', x: 20, y: 10, duration: 50 },
                    { type: 'pointerUp' },
                ],
            },
        ]);
    });
});

describe('swipeScreen', () => {
    it('works for horizontal defaults', async () => {
        const browser = await getFakeBrowser();
        browser.getWindowRect = vi.fn(() =>
            Promise.resolve({ x: 0, y: 0, width: 920, height: 1080 }),
        );
        browser.performActions = vi.fn(() => Promise.resolve());
        await swipeScreen(browser, 'horizontal');
        expect(browser.performActions).toHaveBeenCalledTimes(1);
        expect(browser.performActions).toHaveBeenCalledWith([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', x: 920 * 0.95, y: 1080 / 2, duration: 50 },
                    { type: 'pointerDown' },
                    { type: 'pause', duration: 600 },
                    { type: 'pointerMove', x: 920 * 0.05, y: 1080 / 2, duration: 50 },
                    { type: 'pointerUp' },
                ],
            },
        ]);
    });

    it('works for horizontal custom', async () => {
        const browser = await getFakeBrowser();
        browser.getWindowRect = vi.fn(() =>
            Promise.resolve({ x: 0, y: 0, width: 920, height: 1080 }),
        );
        browser.performActions = vi.fn(() => Promise.resolve());
        await swipeScreen(browser, 'horizontal', 10, 50);
        expect(browser.performActions).toHaveBeenCalledTimes(1);
        expect(browser.performActions).toHaveBeenCalledWith([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', x: 920 * 0.1, y: 1080 / 2, duration: 50 },
                    { type: 'pointerDown' },
                    { type: 'pause', duration: 600 },
                    { type: 'pointerMove', x: 920 * 0.5, y: 1080 / 2, duration: 50 },
                    { type: 'pointerUp' },
                ],
            },
        ]);
    });

    it('works for vertical defaults', async () => {
        const browser = await getFakeBrowser();
        browser.getWindowRect = vi.fn(() =>
            Promise.resolve({ x: 0, y: 0, width: 920, height: 1080 }),
        );
        browser.performActions = vi.fn(() => Promise.resolve());
        await swipeScreen(browser, 'vertical');
        expect(browser.performActions).toHaveBeenCalledTimes(1);
        expect(browser.performActions).toHaveBeenCalledWith([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', x: 920 / 2, y: 1080 * 0.95, duration: 50 },
                    { type: 'pointerDown' },
                    { type: 'pause', duration: 600 },
                    { type: 'pointerMove', x: 920 / 2, y: 1080 * 0.05, duration: 50 },
                    { type: 'pointerUp' },
                ],
            },
        ]);
    });

    it('works for vertical custom', async () => {
        const browser = await getFakeBrowser();
        browser.getWindowRect = vi.fn(() =>
            Promise.resolve({ x: 0, y: 0, width: 920, height: 1080 }),
        );
        browser.performActions = vi.fn(() => Promise.resolve());
        await swipeScreen(browser, 'vertical', 15, 55);
        expect(browser.performActions).toHaveBeenCalledTimes(1);
        expect(browser.performActions).toHaveBeenCalledWith([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', x: 920 / 2, y: 1080 * 0.15, duration: 50 },
                    { type: 'pointerDown' },
                    { type: 'pause', duration: 600 },
                    { type: 'pointerMove', x: 920 / 2, y: 1080 * 0.55, duration: 50 },
                    { type: 'pointerUp' },
                ],
            },
        ]);
    });
});

describe('first', () => {
    it('handle empty array', () => {
        expect(first([])).toEqual(undefined);
    });
    it('return the first element', () => {
        expect(first([1, 2, 3])).toEqual(1);
    });
});

describe('last', () => {
    it('handle empty array', () => {
        expect(last([])).toEqual(undefined);
    });
    it('return the last element', () => {
        expect(last([1, 2, 3])).toEqual(3);
    });
});
