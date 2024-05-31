import type { RemoteCapability } from "@wdio/types/build/Capabilities";

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

  waldoMode?: true;

  waitSessionReady?: boolean;

  /**
   * Open a browser window with the session viewer when the session starts.
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
  "waldo:options"?: WaldoCapabilityOptions;
};

export type CapabilitiesWithWaldo = WebdriverIO.Capabilities & WaldoCapabilities;

export type WaldoRemoteCapability = {
  os_version?: string;
  device?: string;
  screen?: { scale: number; width: number; height: number };
  replayUrl?: string;
  streamUrl?: string;
};

export type RemoteCapabilityWithWaldo = RemoteCapability & WaldoRemoteCapability;

export type WaldoServiceOptions = WaldoSharedOptions;

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
    tap(x: number, y: number): Promise<void>;
    waitForElement(
      property: string,
      value: any,
      timeout?: number,
      delay?: number,
      waitForStability?: boolean,
    ): Promise<void>;
    tapCenterOfBox(box: any): Promise<void>;
    getNodes(predicate: (n: any) => boolean): Promise<any[]>;
    swipeScreen(
      direction: 'vertical' | 'horizontal',
      fromScreenPercent: number,
      toScreenPercent: number,
    ): Promise<void>;
    screenshot(path: string): Promise<void>;
}

export type BrowserWithWaldo = WebdriverIO.Browser & WaldoBrowser;
