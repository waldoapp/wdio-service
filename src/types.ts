import type { Services } from '@wdio/types';
import type { ElementReference } from '@wdio/protocols';
import { WaldoTree, WaldoTreeElement } from './tree-types.js';

export type WaldoEnvironment = 'production' | 'staging' | 'development';

/**
 * Indicates if positions and size are logical coordinates in points (`points = pixel / scale`) or device coordinates
 * in pixels.
 */
export type CoordinateMode = 'logical' | 'device';

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

    /**
     * Indicates if positions and size are logical coordinates in points (`points = pixel / scale`) or device coordinates
     * in pixels. (iOS only)
     */
    coordinateMode?: CoordinateMode;
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

    /** Name of the session that will appear in Waldo session history */
    displayName?: string;

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
    automationName?: string;
};

type PrefixAllProperties<T, Prefix extends string> = {
    [K in keyof T as K extends string ? `${Prefix}:${K}` : never]: T[K];
};

export type WaldoCapabilities = {
    /** Waldo specific options */
    'waldo:options'?: WaldoCapabilityOptions;
} & PrefixAllProperties<WaldoCapabilityOptions, 'waldo'>;

/**
 * The type for capabilities that the test runner can use.
 *
 * Exposed as `Capabilities.TestrunnerCapabilities` in WebDriverIO v9 and
 * `Capabilities.RemoteCapability` in v8
 */
export type TestrunnerCapabilities = Parameters<Required<Services.ServiceInstance>['onPrepare']>[1];

export type CapabilitiesWithWaldo = WebdriverIO.Capabilities & WaldoCapabilities;

export type WaldoRemoteCapability = {
    os_version?: string;
    device?: string;
    screen?: { scale: number; width: number; height: number };
    replayUrl?: string;
    streamUrl?: string;
};

export type RemoteCapabilityWithWaldo = TestrunnerCapabilities & WaldoRemoteCapability;

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

    /**
     * Wait until an element appears that has the `property` equal to `value` and returns it.
     *
     * An error will be thrown if the element can't be found after the timeout.
     *
     * Example:
     *
     * ```ts
     * const element = await driver.waitForElement('text', 'Hello, World!');
     * ```
     *
     * @param property Name of the property to match on elements
     * @param value Expected value of the property
     * @param timeout Maximum time in milliseconds to wait for the element to appear. Default to `5000`.
     * @param delay Interval in milliseconds between checks for the element. Default to `500`.
     * @param waitForStability If enabled wait for the element position to stabilize before tapping. Default to `false`.
     */
    waitForElement(
        property: string,
        value: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<AppiumElement>;

    /**
     * Simulate a 'tap' gesture at the given coordinates.
     *
     * This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerUp`.
     *
     * Example:
     *
     * ```ts
     * await driver.tap(100, 200);
     * ```
     *
     * @param x The x-coordinate of the tap
     * @param y The y-coordinate of the tap
     */
    tap(x: number, y: number): Promise<void>;

    /**
     * Wait until an element appears that has the `property` equal to `value` and then tap on it.
     *
     * An error will be thrown if the element can't be found after the timeout.
     *
     * Example:
     *
     * ```ts
     * await driver.tapElement('text', 'Skip');
     * ```
     *
     * @param property Name of the property to match on elements
     * @param value Expected value of the property
     * @param timeout Maximum time in milliseconds to wait for the element to appear. Default to`5000`.
     * @param delay Interval in milliseconds between checks for the element. Default to `500`.
     * @param waitForStability If enabled wait for the element position to stabilize before tapping. Default to`false`.
     */
    tapElement(
        property: string,
        value: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;

    /**
     * Wait until an element appears that matches the predicate in the Waldo tree and then tap on it.
     *
     * An error will be thrown if the element can't be found after the retries.
     *
     * Example:
     *
     * ```ts
     * await driver.tapElementWith((n) => n.text === 'Skip');
     * ```
     *
     * **Note**: This command is only available when using the Waldo automation via the
     * `'waldo:automationName': 'Waldo'` capability.
     *
     * @param predicate A function that returns `true` for the element to tap on
     * @param position Index of the element to match if there are multiple matches, or `'first'` or `'last'`. Default to `0`.
     * @param retries Maximum number of retries to find the element. Default to`3`.
     * @param delay Interval in milliseconds between retries. Default to`500`.
     */
    tapElementWith(
        predicate: (n: WaldoTreeElement) => boolean,
        position?: number | 'first' | 'last',
        retries?: number,
        delay?: number,
    ): Promise<void>;

    /**
     * Wait until an element appears that has the `property` equal to `value` and then type `text` in it.
     *
     * An error will be thrown if the element can't be found after the timeout.
     *
     * Example:
     *
     * ```ts
     * await driver.typeInElement('placeholder', 'email address', 'test@example.com');
     * ```
     *
     * @param property Name of the property to match on elements
     * @param value Expected value of the property
     * @param text The text to type in the element
     * @param timeout Maximum time in milliseconds to wait for the element to appear. Default to`5000`.
     * @param delay Interval in milliseconds between checks for the element. Default to`500`.
     * @param waitForStability If enabled wait for the element position to stabilize before tapping. Default to`false`.
     */
    typeInElement(
        property: string,
        value: string,
        text: string,
        timeout?: number,
        delay?: number,
        waitForStability?: boolean,
    ): Promise<void>;

    /**
     * Simulate a 'tap' gesture at the center of the given bounding box.
     *
     * Example:
     *
     * ```ts
     * const box = await driver.getNodes((n) => n.text === 'Skip')[0];
     * await driver.tapCenterOfBox(box);
     * ```
     */
    tapCenterOfBox(box: BoundingBoxLike): Promise<void>;

    /**
     * Get all nodes in the Waldo tree that match the given predicate.
     *
     * Example:
     *
     * ```ts
     * const okButtons = await driver.getNodes(
     *   // Find all nodes with a text that contains 'ok' case insensitive
     *   (n) => n.text && n.text.match(/ok/i) !== null,
     * );
     * ```
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
     * Example:
     *
     * ```ts
     * // Swipe from top to bottom
     * await driver.swipeScreen('vertical', 10, 90);
     * ```
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
     * Example:
     *
     * ```ts
     * // Final path will be ./screenshots/screenshot.png
     * await driver.screenshot('screenshot.png');
     * ```
     *
     * @param path The path to save the screenshot to
     */
    screenshot(path: string): Promise<void>;

    /**
     * Send a log line that will be visible in the Waldo Session Viewer
     *
     * Example:
     *
     * ```ts
     * await driver.log('Found logged in user', { name: detectedUserName }, 'debug');
     * ```
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
