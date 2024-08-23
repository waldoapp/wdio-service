import axios, { AxiosError } from 'axios';
import logger from '@wdio/logger';

import { getRemoteBaseUrl, getWdUrl } from './urls.js';
import type {
    AppiumElement,
    BoundingBox,
    BoundingBoxLike,
    SessionInfo,
    SwipeDirection,
} from './types.js';
import type { WaldoTree, WaldoTreeElement } from './tree-types.js';
import { parseXmlAsWaldoTree } from './tree-parser.js';
import type { ElementReference, RectReturn } from '@wdio/protocols';
import { ELEMENT_KEY } from 'webdriver';

const log = logger('@waldoapp/wdio-service');

export function last<T>(arr: readonly T[]): T | undefined {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export function first<T>(arr: readonly T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

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

export function resolveBoundingBox(box: BoundingBoxLike): BoundingBox {
    if ('top' in box) {
        return box;
    } else {
        return {
            top: box.y,
            left: box.x,
            width: box.width,
            height: box.height,
        };
    }
}

export async function logEvent(
    driver: WebdriverIO.Browser,
    message: string,
    payload: Record<string, string | boolean | number>,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info',
) {
    const url = `${getRemoteBaseUrl(driver)}/wd/hub/session/${driver.sessionId}/timelineEvent`;
    try {
        await axios.post(url, { level, message, payload });
    } catch (e: unknown) {
        let errorMessage = 'Failed';
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        let data: any = undefined;
        if (e instanceof AxiosError) {
            data = e.response?.data;
        }

        // Log the problem locally but don't fail the test
        log.error(`Failed to log event "${message}": ${errorMessage}`, data);
    }
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

    switch (direction) {
        case 'vertical':
            swipeDirection.fromX = middleX;
            swipeDirection.toX = middleX;
            swipeDirection.fromY = Math.round(screen.height * (fromScreenPercent / 100));
            swipeDirection.toY = Math.round(screen.height * (toScreenPercent / 100));
            break;
        case 'horizontal':
            swipeDirection.fromY = middleY;
            swipeDirection.toY = middleY;
            swipeDirection.fromX = Math.round(screen.width * (fromScreenPercent / 100));
            swipeDirection.toX = Math.round(screen.width * (toScreenPercent / 100));
            break;
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

async function tryFindElement(
    driver: WebdriverIO.Browser,
    using: string,
    value: string,
): Promise<ElementReference | null> {
    try {
        const element = await driver.findElement(using, value);

        // In case of 'no such element' errors, webdriver returns the error object
        // (That should have no 'ELEMENT' key)
        if (!(ELEMENT_KEY in element)) {
            return null;
        }

        return element;
    } catch (e) {
        if (!isNodeError(e)) {
            throw e;
        }

        // We shouldn't end there as webdriver tries to treat 'no such element' errors as non-errors
        // But detection is based on heuristics (matching the specific error message text) when a remote endpoint
        // returns the legacy jsonwire 'status' field.
        //
        // Waldo returns both 'status' from jsonwire and the W3C 'error' field inside value, being careful to return an
        // Appium compatible error message, but better safe than sorry.
        if (e.name === 'no such element') {
            return null;
        }

        throw e;
    }
}

export async function waitForElement(
    driver: WebdriverIO.Browser,
    property: string,
    value: string,
    timeout?: number,
    delay?: number,
    waitForStability: boolean = false,
): Promise<ElementReference> {
    const resolvedTimeout = timeout ?? driver.options.waitforTimeout ?? 5000;
    const resolvedDelay = delay ?? driver.options.waitforInterval ?? 500;

    const logPayload = { timeout: resolvedTimeout, delay: resolvedDelay, property, value };

    await logEvent(
        driver,
        `Waiting for element with "${property}"='${value}' to show up`,
        logPayload,
        'debug',
    );
    const start = Date.now();
    let element = await tryFindElement(driver, property, value);
    if (!element) {
        try {
            const remaining = resolvedTimeout === 0 ? 0 : resolvedTimeout - (Date.now() - start);
            await driver.waitUntil(
                async () => {
                    element = await tryFindElement(driver, property, value);
                    return element !== null;
                },
                { timeout: remaining, interval: resolvedDelay },
            );
        } catch (e) {
            await logEvent(
                driver,
                `Could not find element with "${property}"='${value}'`,
                logPayload,
                'error',
            );
            let message = `Could not find element with "${property}"='${value}'`;
            if (e instanceof Error) {
                message += `: ${e.message}`;
            }
            throw new Error(message, { cause: e });
        }
    }

    if (!element) {
        throw new Error(`Can't find element with "${property}"='${value}'`);
    }

    // This will wait for an element to have a stable position for some time before returning.
    if (waitForStability) {
        let stable = false;
        let location: RectReturn | undefined;
        while (!stable) {
            if (resolvedTimeout !== 0 && Date.now() - start > resolvedTimeout) {
                await logEvent(
                    driver,
                    `Element with "${property}"='${value}' was still not stable`,
                    logPayload,
                    'error',
                );
                throw new Error(`Element still not stable after ${resolvedTimeout}ms`);
            }
            element = await tryFindElement(driver, property, value);
            if (element) {
                const newLocation = await driver.getElementRect(element[ELEMENT_KEY]);
                stable =
                    location !== undefined &&
                    newLocation.x === location.x &&
                    newLocation.y === location.y &&
                    newLocation.width === location.width &&
                    newLocation.height === location.height;
                location = newLocation;
            }
        }

        if (!element) {
            throw new Error(
                `Element with "${property}"='${value}' was removed while checking for stability`,
            );
        }
    }
    await logEvent(driver, `Found element "${property}"='${value}'`, logPayload, 'debug');
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
    await driver.elementClick(element[ELEMENT_KEY]);
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
            let node: WaldoTreeElement | undefined;
            if (position === 'last') {
                node = last(nodes);
            } else if (position === 'first') {
                node = first(nodes);
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
    await driver.elementClick(element[ELEMENT_KEY]);
    await driver.setValueImmediate(element[ELEMENT_KEY], text);
}

export function isNodeError(error: any): error is NodeJS.ErrnoException {
    return error instanceof Error;
}
