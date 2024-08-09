import type { Capabilities } from '@wdio/types';
import type { ElementReference } from '@wdio/protocols';
import { WaldoTree, WaldoTreeElement } from './tree-types.js';

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
    /** Name of the session that will appear in Waldo session history */
    'waldo:displayName'?: string;

    /**
     * Type of automation to use
     *
     * - `'UiAutomator2'`, `'XCUITest'` and `'Appium'` emulate Appium.
     * - `'Waldo'` is the full automation.
     *
     * Default is to emulate Appium for the application platform. (`'UiAutomator2'` for android and `'XCUITest'`
     * for iOS)
     *
     * Case insensitive
     */
    'waldo:automationName'?: string;

    /** Waldo specific options */
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

export type BoundingBoxLike = BoundingBox | Pick<WaldoTreeElement, 'x' | 'y' | 'width' | 'height'>;

export type WaldoBrowser = {
    resetApp(): Promise<void>;
    tapElement(
        property: string,
        value: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;
    tapElementWith(
        predicate: (n: WaldoTreeElement) => boolean,
        position?: number | 'first' | 'last',
        retries?: number,
        delay?: number,
    ): Promise<void>;
    typeInElement(
        property: string,
        value: string,
        text: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;

    /**
     * Simulate a 'tap' gesture at the given coordinates.
     *
     * This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerUp`.
     *
     * @param x The x-coordinate of the tap
     * @param y The y-coordinate of the tap
     */
    tap(x: number, y: number): Promise<void>;
    waitForElement(
        property: string,
        value: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<AppiumElement>;

    /**
     * Simulate a 'tap' gesture at the center of the given bounding box.
     */
    tapCenterOfBox(box: BoundingBoxLike): Promise<void>;

    /**
     * Get all nodes in the Waldo tree that match the given predicate.
     *
     * **Note**: This command is only available when using the Waldo automation via the
     * `'waldo:automationName': 'Waldo'` capability.
     */
    getNodes(predicate?: (n: WaldoTreeElement) => boolean): Promise<WaldoTreeElement[]>;

    /**
     * Parse the current Waldo tree returned by `getPageSource()` and return it as a JSON object.
     *
     * **Note**: This command is only available when using the Waldo automation via the
     * `'waldo:automationName': 'Waldo'` capability.
     */
    getWaldoTree(): Promise<WaldoTree>;

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

export type AppiumElement = ElementReference & { ELEMENT: string };

export type SessionDevice = {
    model: string;
    os: 'android' | 'ios';
    osVersion: string;
    screen: { width: number; height: number };
};

export type SessionInfo = {
    status: 'complete' | 'failed' | 'setup' | 'ready';
    id: string;
    device: SessionDevice;
};

export type SwipeDirection = 'vertical' | 'horizontal';
