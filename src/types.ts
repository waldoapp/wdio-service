import type { Capabilities } from '@wdio/types';

import type { AppiumElement } from './utils.js';

export type WaldoEnvironment = 'production' | 'staging' | 'development';

type WaldoSharedOptions = {
    /**
     * Security token
     *
     * Can either be a user-scoped token for development found in the
     * [user settings](https://app.waldo.com/settings/profile) or an application-scoped CI token found
     * in the App Configuration.
     *
     * Can also be provided as `key` in the test runner options or in the `WALDO_API_TOKEN`
     * environment variable.
     */
    token?: string;

    /**
     * Use the non-appium compatible Waldo tree.
     */
    waldoMode?: boolean;

    /**
     * Wait for the session to be fully ready and the application launched before starting the test.
     *
     * Otherwise the test will start as soon as the device is available.
     */
    waitSessionReady?: boolean;

    /**
     * Open the Waldo interactive session viewer in a browser when a test is started.
     *
     * This option has no effect when `sessionId` is specified.
     *
     * Default: `false`
     */
    showSession?: boolean;

    /**
     * ID of an existing session to connect to instead of creating a new one.
     *
     * Used for interactive development.
     */
    sessionId?: string;

    /**
     * ID (`appv-0123456789abcdef`) of the application version to use for the session.
     */
    versionId?: string;
};

export type WaldoCapabilityOptions = WaldoSharedOptions & {
    /**
     * Name of the device to use, like `iPhone 15` or `Pixel 7`
     */
    deviceName?: string;

    /**
     * Operating system version to use, like `17.0` or `33.0`
     */
    osVersion?: string;
};

export type WaldoCapabilities = {
    'waldo:options'?: WaldoCapabilityOptions;
};

export type CapabilitiesWithWaldo = WebdriverIO.Capabilities & WaldoCapabilities;

export type WaldoRemoteCapability = {
    os_version?: string;
    device?: string;
    screen?: { scale: number; width: number; height: number };
    replayUrl?: string;
    streamUrl?: string;
};

export type RemoteCapabilityWithWaldo = Capabilities.RemoteCapability & WaldoRemoteCapability;

export type WaldoServiceOptions = WaldoSharedOptions & {
    /**
     * Waldo environment.
     *
     * Default: `production`
     */
    environment?: WaldoEnvironment;
};

export type BoundingBox = { width: number; height: number; top: number; left: number };

export type WaldoBrowser = {
    resetApp(): Promise<void>;
    tapElement(
        property: string,
        value: any,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;
    tapElementWith(
        predicate: (n: any) => boolean,
        position?: number | 'first' | 'last',
        retries?: number,
        delay?: number,
    ): Promise<void>;
    typeInElement(
        property: string,
        value: any,
        text: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;

    /**
     * Simulate a 'tap' gesture at the given coordinates.
     *
     * This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerUp`.
     */
    tap(x: number, y: number): Promise<void>;
    waitForElement(
        property: string,
        value: any,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<AppiumElement>;

    /**
     * Simulate a 'tap' gesture at the center of the given bounding box.
     */
    tapCenterOfBox(box: BoundingBox): Promise<void>;
    getNodes(predicate: (n: any) => boolean): Promise<any[]>;

    /**
     * Simulate a 'swipe' gesture in the given direction.
     *
     * The default movement without any options is a horizontal swipe from right (`95`) to left (`5`).
     *
     * This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerMove`, `pointerUp`.
     *
     * @param direction The direction of the swipe, either `vertical` or `horizontal`. Default to `horizontal`.
     * @param fromScreenPercent The starting point of the swipe as a percentage of the screen size. Default to `95`.
     * @param toScreenPercent The ending point of the swipe as a percentage of the screen size. Default to `5`.
     */
    swipeScreen(
        direction?: 'vertical' | 'horizontal',
        fromScreenPercent?: number,
        toScreenPercent?: number,
    ): Promise<void>;

    /**
     * A simplified wrapper around the `saveScreenshot` command that saves the screenshot to a file in the
     * `./screenshots/` directory, creating it if necessary.
     *
     * **Note**: If an absolute path is provided, this function is equivalent to calling `saveScreenshot`
     * directly.
     *
     * @param path The path to save the screenshot to
     */
    screenshot(path: string): Promise<void>;

    /**
     * Send a log line that will be visible in the Waldo Session Viewer
     *
     * @param message The message to log
     * @param payload Additional data to log that will be visible when the log line is selected
     * @param level The log level, one of `debug`, `info`, `warn`, or `error`. Default to `info`.
     */
    log(
        message: string,
        payload?: Record<string, string | boolean | number>,
        level?: 'debug' | 'info' | 'warn' | 'error',
    ): Promise<void>;
};

export type BrowserWithWaldo = WebdriverIO.Browser & WaldoBrowser;
