import { promises as fsPromises } from 'fs';
import pathLib from 'path';
import process from 'process';

import { command } from 'webdriver';
import logger from '@wdio/logger';

import { BoundingBoxLike, SwipeDirection } from './types.js';
import {
    tapElement,
    tapElementWith,
    typeInElement,
    performTap,
    waitForElement,
    tapCenterOfBox,
    swipeScreen,
    logEvent,
    findInTree,
    getWaldoTree,
    resolveBoundingBox,
} from './utils.js';
import { WaldoTreeElement } from './tree-types.js';

const log = logger('@waldoapp/wdio-service');

export function addDriverCommands(driver: WebdriverIO.Browser) {
    driver.addCommand(
        'resetApp',
        command('POST', '/session/:sessionId/appium/app/reset', {
            command: 'reset',
            description: 'application reset',
            ref: 'http://appium.io/docs/en/commands/device/app/reset-app/',
            parameters: [],
        }),
    );

    driver.addCommand(
        'tapElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: string,
            timeout: number = 5000,
            delay: number = 500,
            waitForStability: boolean = false,
        ) {
            return tapElement(this, property, value, timeout, delay, waitForStability);
        },
    );

    // Thin wrapper around saveScreenshot to ensure that the destination directory always exists
    driver.addCommand(
        'screenshot',
        async function commandFn(this: WebdriverIO.Browser, filepath: string) {
            let screenshotPath = filepath;
            if (!pathLib.isAbsolute(filepath)) {
                screenshotPath = pathLib.join(process.cwd(), 'screenshots', filepath);
                const { dir } = pathLib.parse(screenshotPath);
                const exists = await fsPromises
                    .access(dir)
                    .then(() => true)
                    .catch(() => false);
                if (!exists) {
                    log.info(`Initialize screenshot dir ${dir}`);
                    await fsPromises.mkdir(dir, { recursive: true });
                }
            }

            await this.saveScreenshot(screenshotPath);
        },
    );

    driver.addCommand(
        'tapElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: string,
            timeout: number = 5000,
            delay: number = 500,
            waitForStability: boolean = false,
        ) {
            return tapElement(this, property, value, timeout, delay, waitForStability);
        },
    );

    driver.addCommand(
        'tapElementWith',
        async function commandFn(
            this: WebdriverIO.Browser,
            predicate: (n: WaldoTreeElement) => boolean,
            position: number | 'first' | 'last' = 0,
            retries: number = 3,
            delay: number = 500,
        ) {
            return tapElementWith(this, predicate, position, retries, delay);
        },
    );

    driver.addCommand(
        'typeInElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: string,
            text: string,
            timeout: number = 5000,
            delay: number = 500,
            waitForStability: boolean = false,
        ) {
            return typeInElement(this, property, value, text, timeout, delay, waitForStability);
        },
    );

    driver.addCommand(
        'tap',
        async function commandFn(this: WebdriverIO.Browser, x: number, y: number) {
            return performTap(this, x, y);
        },
    );

    driver.addCommand(
        'waitForElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: string,
            timeout: number = 5000,
            delay: number = 500,
            waitForStability: boolean = false,
        ) {
            return waitForElement(this, property, value, timeout, delay, waitForStability);
        },
    );

    driver.addCommand(
        'tapCenterOfBox',
        async function commandFn(this: WebdriverIO.Browser, box: BoundingBoxLike) {
            return tapCenterOfBox(this, resolveBoundingBox(box));
        },
    );

    driver.addCommand('getWaldoTree', async function commandFn(this: WebdriverIO.Browser) {
        return getWaldoTree(this);
    });

    driver.addCommand(
        'getNodes',
        async function commandFn(
            this: WebdriverIO.Browser,
            predicate?: (n: WaldoTreeElement) => boolean,
        ) {
            return findInTree(this, predicate ?? (() => true));
        },
    );

    driver.addCommand(
        'swipeScreen',
        async function commandFn(
            this: WebdriverIO.Browser,
            direction: SwipeDirection,
            fromScreenPercent: number,
            toScreenPercent: number,
        ) {
            return swipeScreen(this, direction, fromScreenPercent, toScreenPercent);
        },
    );

    driver.addCommand(
        'log',
        async function commandFn(
            this: WebdriverIO.Browser,
            message: string,
            payload: Record<string, string | boolean | number> = {},
            level: 'debug' | 'info' | 'warn' | 'error' = 'debug',
        ) {
            log.debug(`Sending log [${level}]: ${message} - ${JSON.stringify(payload)}`);
            return logEvent(this, message, payload, level);
        },
    );
}
