# WebdriverIO Waldo Service

[![CI](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml/badge.svg)](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml)

WebdriverIO service that provides a better integration into [Waldo](https://www.waldo.com/scripting).

What this package provide:
- Automatic configuration of Waldo as the webdriver endpoint
- A set of additional commands to ease mobile testing
- TypeScript definition for the options and mobile specific capabilities

## Installation

The easiest way is to keep `@waldoapp/wdio-service` as a devDependency in your `package.json` via:

```sh
npm install @waldoapp/wdio-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](https://webdriver.io/docs/gettingstarted)

## Configuration

To use the Waldo service you'll need to provide a valid Waldo API token. The token can be provided via the environment
variable `WALDO_API_TOKEN` or via the `key` option in your `wdio.conf.ts` file.

The token can either be a user-scoped token for development found in the
[user settings](https://app.waldo.com/settings/profile) or an application-scoped CI token found in the App Configuration.

```ts
// wdio.conf.ts
import type { Options } from '@wdio/types'
import '@waldoapp/wdio-service';

export const config: Options.Testrunner = {
    // This is done automatically if no key is provided,
    // the WALDO_API_TOKEN environment variable is used
    key: process.env.WALDO_API_TOKEN,

    services: [['@waldoapp/wdio-service',{
        showSession: true
    }]],
}
```

To run successfully the application binary to test must have been uploaded to Waldo, this will generate a build version
ID of the form `appv-0123456789abcdef`. This version ID can be provided in the `versionId` option or in the
`appium:app` capability field for Appium compatibility.

It isn't necessary to provide the `versionId` if an existing running session is specified with the `sessionId` option.

## Waldo Service Options

To authorize the Waldo service your config needs to contain a [`key`](https://webdriver.io/docs/options#key) option.

### token

Security token.

Can also be provided as `key` in the test runner options or in the `WALDO_API_TOKEN` environment variable.

Type: `string`
Default: `undefined`

### waldoMode

The default behavior of the Waldo service is to return a tree similar to the one returned by Appium for compatibility.

This option enable the full Waldo tree mode. In this mode the tree returned can be a lot better and unifies native
elements, Web views, React Native and Flutter elements but the schema is different and incompatible with scripts not
specifically targeting Waldo.

Type: `boolean`
Default: `false`

### showSession

Open the Waldo interactive session viewer in a browser when a test is started.

This option has no effect when a `sessionId` is specified.

Type: `boolean`
Default: `false`

### waitSessionReady

Wait for the session to be fully ready and the application launched before starting the test. Otherwise the test will
start as soon as the device is available.

Type: `boolean`
Default: `false`

### sessionId

ID of an existing waldo session (Created via `Sessions > Live > Start session`) to connect to for interactive
development.

Can also be provided in the `WALDO_SESSION_ID` or `SESSION_ID` environment variables.

Type: `string`
Default: `undefined`

### versionId

ID (`appv-0123456789abcdef`) of the application version to use for the session.

Can also be provided in the `WALDO_APP_VERSION_ID` or `WALDO_APP_VERSION_ID` environment variables.

Can also be provided in the `appium:app` capability field for Appium compatibility.

Type: `string`
Default: `undefined`

## Device capabilities

Most of the service options can also be provided in the capabilities object for a specific device inside the `waldo:options` key:

```ts
capabilities: [{
    platformName: 'Android',
    deviceName: 'Pixel 3a',
    'waldo:options': {
        showSession: true
    }
}]
```

### deviceName

Name of the device to use for the session, like `iPhone 15` or `Pixel 7`.

If not specified the default device configured for the App in Waldo will be used.

Type: `string`
Default: `undefined`

### osVersion

Operating system version to use, like `17.0` or `33.0`

If not specified the default device configured for the App in Waldo will be used.

Type: `string`
Default: `undefined`
