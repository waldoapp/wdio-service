import _ from 'lodash';
import axios from 'axios';
import logger from '@wdio/logger';

import { getRemoteBaseUrl, getWdUrl } from './urls.js';
import type { AppiumElement, BoundingBox, SessionInfo, SwipeDirection } from './types.js';
import type { WaldoTree, WaldoTreeElement } from './tree-types.js';
import { parseXmlAsWaldoTree } from './tree-parser.js';

const log = logger('@waldoapp/wdio-service');

export async function waitAsPromise(timeMillis: number) {
    await new Promise<void>((resolve): void => {
        setTimeout(() => resolve(), timeMillis);
    });
}

async function getSessionInfo(
    driver: WebdriverIO.Browser,
    sessionId: string,
): Promise<SessionInfo> {
    const waldoSessionUrl = getWdUrl(driver, `/session/${sessionId}`);
    const { data } = await axios(waldoSessionUrl);
    return data;
}

export async function getLatestBuilds(token: string) {
    const { data } = await axios.get('https://api.waldo.com/versions', {
        headers: {
            authorization: `Upload-Token ${token}`,
        },
    });
    return data;
}

export async function getLatestBuild(token: string) {
    const builds = await getLatestBuilds(token);
    return builds[0];
}

export async function waitForSessionReady(driver: WebdriverIO.Browser) {
    const sessionInfo = await getSessionInfo(driver, driver.sessionId);
    log.info(`Preparing device and installing your application...`);
    if (sessionInfo.status === 'setup') {
        await waitAsPromise(5000);
        await waitForSessionReady(driver);
        return;
    }
    if (sessionInfo.status !== 'ready') {
        throw new Error(`Session is in bad state ${sessionInfo.status}`);
    }
    log.info('Waldo session is ready');
}

export async function logEvent(
    driver: WebdriverIO.Browser,
    message: string,
    payload: Record<string, string | boolean | number>,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info',
) {
    const url = `${getRemoteBaseUrl(driver)}/wd/hub/session/${driver.sessionId}/timelineEvent`;
    await axios.post(url, { level, message, payload });
}

export function performTap(driver: WebdriverIO.Browser, x: number, y: number) {
    return driver.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', x, y, duration: 50 },
                { type: 'pointerDown', x, y },
                { type: 'pause', duration: 50 },
                { type: 'pointerUp' },
            ],
        },
    ]);
}

export function performSwipe(
    driver: WebdriverIO.Browser,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
) {
    return driver.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', x: fromX, y: fromY, duration: 50 },
                { type: 'pointerDown' },
                { type: 'pause', duration: 600 },
                { type: 'pointerMove', x: toX, y: toY, duration: 50 },
                { type: 'pointerUp' },
            ],
        },
    ]);
}

export async function swipeScreen(
    driver: WebdriverIO.Browser,
    direction: SwipeDirection = 'horizontal',
    fromScreenPercent: number = 95,
    toScreenPercent: number = 5,
) {
    if (
        fromScreenPercent < 0 ||
        fromScreenPercent > 100 ||
        toScreenPercent < 0 ||
        toScreenPercent > 100
    ) {
        throw new Error('fromScreenPercent and toScreenPercent should be between 0 and 100');
    }
    const screen = await driver._getWindowSize();
    const swipeDirection = { fromX: 0, fromY: 0, toX: 0, toY: 0 };
    const middleX = Math.round(screen.width / 2);
    const middleY = Math.round(screen.height / 2);
    if (direction === 'vertical') {
        swipeDirection.fromX = middleX;
        swipeDirection.toX = middleX;
        swipeDirection.fromY = Math.round(screen.height * (fromScreenPercent / 100));
        swipeDirection.toY = Math.round(screen.height * (toScreenPercent / 100));
    }
    if (direction === 'horizontal') {
        swipeDirection.fromY = middleY;
        swipeDirection.toY = middleY;
        swipeDirection.fromX = Math.round(screen.height * (fromScreenPercent / 100));
        swipeDirection.toX = Math.round(screen.height * (toScreenPercent / 100));
    }
    await performSwipe(
        driver,
        swipeDirection.fromX,
        swipeDirection.fromY,
        swipeDirection.toX,
        swipeDirection.toY,
    );
}

export async function tapCenterOfBox(driver: WebdriverIO.Browser, box: BoundingBox) {
    const x = Math.round(box.left + box.width / 2);
    const y = Math.round(box.top + box.height / 2);
    await performTap(driver, x, y);
}

export async function waitForElement(
    driver: WebdriverIO.Browser,
    property: string,
    value: string,
    timeout: number = 5000,
    delay: number = 500,
    waitForStability: boolean = false,
): Promise<AppiumElement> {
    await logEvent(
        driver,
        `Waiting for element with "${property}"='${value}' to show up`,
        { timeout, delay, property, value },
        'debug',
    );
    const start = Date.now();
    let element = (await driver.findElement(property, value)) as AppiumElement;
    if (!element.ELEMENT) {
        try {
            await driver.waitUntil(
                async () => {
                    element = (await driver.findElement(property, value)) as AppiumElement;
                    return !!element.ELEMENT;
                },
                { timeout, interval: delay },
            );
        } catch (e) {
            await logEvent(
                driver,
                `Could not find element with "${property}"='${value}'`,
                { timeout, delay, property, value },
                'error',
            );
            throw e;
        }
    }
    // This will wait for an element to have a stable position for some time before returning.
    if (waitForStability) {
        let stable = false;
        let location = {};
        while (!stable) {
            if (Date.now() - start > timeout) {
                await logEvent(
                    driver,
                    `Element with "${property}"='${value}' was still not stable`,
                    { timeout, delay, property, value },
                    'error',
                );
                throw new Error(`Element still not stable after ${timeout}ms`);
            }
            element = (await driver.findElement(property, value)) as AppiumElement;
            if (element?.ELEMENT) {
                const newLocation = await driver.getElementLocation(element.ELEMENT);
                stable = _.isEqual(newLocation, location);
                location = newLocation;
            }
        }
    }
    await logEvent(
        driver,
        `Found element "${property}"='${value}'`,
        { timeout, delay, property, value },
        'debug',
    );
    return element;
}

export async function waitForElementGone(
    driver: WebdriverIO.Browser,
    property: string,
    value: string,
    timeout: number = 5000,
    delay: number = 500,
) {
    await logEvent(
        driver,
        `Waiting for element "${property}"='${value}' to be gone`,
        { timeout, delay, property, value },
        'debug',
    );
    await driver.waitUntil(
        async () => {
            const element = (await driver.findElement(property, value)) as AppiumElement;
            return !element.ELEMENT;
        },
        { timeout, interval: delay },
    );
}

export async function getWaldoTree(driver: WebdriverIO.Browser): Promise<WaldoTree> {
    const treeString = await driver.getPageSource();

    return parseXmlAsWaldoTree(treeString);
}

export function* enumerateTreeElements(tree: WaldoTree): Iterable<WaldoTreeElement> {
    for (const window of tree.windows) {
        const stack = [window.root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node) {
                stack.push(...node.children);
                yield node;
            }
        }
    }
}

export function* filter<T>(iterable: Iterable<T>, selector: (value: T) => boolean): Iterable<T> {
    for (const value of iterable) {
        if (selector(value)) {
            yield value;
        }
    }
}

export function findInWaldoTree(tree: WaldoTree, predicate: (n: WaldoTreeElement) => boolean) {
    return [...filter(enumerateTreeElements(tree), predicate)];
}

export async function findInTree(
    driver: WebdriverIO.Browser,
    predicate: (n: WaldoTreeElement) => boolean,
) {
    const tree = await getWaldoTree(driver);
    return findInWaldoTree(tree, predicate);
}

export async function tapElement(
    driver: WebdriverIO.Browser,
    property: string,
    value: string,
    timeout: number = 5000,
    delay: number = 500,
    waitForStability: boolean = false,
) {
    const element = await waitForElement(driver, property, value, timeout, delay, waitForStability);
    await driver.elementClick(element.ELEMENT);
}

/**
 * Tap on the element at given position in the list of elements that validate the predicate
 */
export async function tapElementWith(
    driver: WebdriverIO.Browser,
    predicate: (n: WaldoTreeElement) => boolean,
    position: number | 'first' | 'last' = 0,
    retries: number = 3,
    delay: number = 500,
) {
    for (let i = 0; i < retries; i += 1) {
        const nodes = await findInTree(driver, predicate);
        if (nodes.length > 0) {
            let node;
            if (position === 'last') {
                node = _.last(nodes);
            } else if (position === 'first') {
                node = _.first(nodes);
            } else if (nodes.length > position) {
                node = nodes[position];
            }

            if (node) {
                await tapCenterOfBox(driver, {
                    width: node.width,
                    height: node.height,
                    top: node.y,
                    left: node.x,
                });
                return;
            }
        }
        await waitAsPromise(delay);
    }
    throw new Error(`Could not find node`);
}

export async function typeInElement(
    driver: WebdriverIO.Browser,
    property: string,
    value: string,
    text: string,
    timeout: number = 5000,
    delay: number = 500,
    waitForStability: boolean = false,
) {
    const element = await waitForElement(driver, property, value, timeout, delay, waitForStability);
    await driver.elementClick(element.ELEMENT);
    await driver.setValueImmediate(element.ELEMENT, text);
}

export function isNodeError(error: any): error is NodeJS.ErrnoException {
    return error instanceof Error;
}
