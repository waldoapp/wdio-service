import { promises as fsPromises } from 'fs';
import { resolve as pathResolve, parse as pathParse } from 'path';

import { command } from 'webdriver';
import logger from '@wdio/logger';

import { BoundingBox } from './types.js';
import {
    tapElement,
    tapElementWith,
    typeInElement,
    performClick,
    waitForElement,
    tapCenterOfBox,
    findInTree,
    SwipeDirection,
    swipeScreen,
    logEvent,
} from './utils.js';

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
            value: any,
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
        async function commandFn(this: WebdriverIO.Browser, relativeDestination: string) {
            const screenshotPath = pathResolve(
                `${__dirname}/../screenshots/${relativeDestination}`,
            );
            const { dir } = pathParse(screenshotPath);
            const exists = await fsPromises
                .access(dir)
                .then(() => true)
                .catch(() => false);
            if (!exists) {
                log.debug(`Initialize screenshot dir ${dir}`);
                await fsPromises.mkdir(dir, { recursive: true });
            }
            await this.saveScreenshot(screenshotPath);
        },
    );

    driver.addCommand(
        'tapElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: any,
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
            predicate: (n: any) => boolean,
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
            value: any,
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
            return performClick(this, x, y);
        },
    );

    driver.addCommand(
        'waitForElement',
        async function commandFn(
            this: WebdriverIO.Browser,
            property: string,
            value: any,
            timeout: number = 5000,
            delay: number = 500,
            waitForStability: boolean = false,
        ) {
            return waitForElement(this, property, value, timeout, delay, waitForStability);
        },
    );

    driver.addCommand(
        'tapCenterOfBox',
        // eslint-disable-next-line prefer-arrow-callback
        async function commandFn(this: WebdriverIO.Browser, box: BoundingBox) {
            return tapCenterOfBox(this, box);
        },
    );

    driver.addCommand(
        'getNodes',
        async function commandFn(this: WebdriverIO.Browser, predicate: (n: any) => boolean) {
            return findInTree(this, predicate);
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
