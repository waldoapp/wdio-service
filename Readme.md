# WebdriverIO Waldo Service

[![NPM](https://img.shields.io/npm/v/%40waldoapp%2Fwdio-service)](https://www.npmjs.com/package/@waldoapp/wdio-service)
[![CI](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml/badge.svg)](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml)

A [WebdriverIO](https://webdriver.io/) service that provides better integration with [Waldo](https://www.waldo.com/scripting).

This package provides:

- Automatic configuration of Waldo as the webdriver endpoint.
- A collectin of additional commands to ease mobile testing.
- A TypeScript definition for the options and mobile-specific capabilities.

## Installation

The easiest way to install this package is to define `@waldoapp/wdio-service` as a `devDependency` in your
`package.json`:

```sh
npm install @waldoapp/wdio-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here](https://webdriver.io/docs/gettingstarted).

## Configuration

To use the Waldo service, you need to provide a valid Waldo API token. This token can be specified by defining the `WALDO_API_TOKEN` environment variable, or by including the `key` option in your `wdio.conf.ts` file.

The API token can be either a user-scoped token for development found in the
[“Profile” tab of your Waldo account settings](https://app.waldo.com/settings/profile), or an application-scoped CI
token found in the [“General” tab of the “Configuration”](https://app.waldo.com/applications/0/configurations/general)
for your app.

```ts
// wdio.conf.ts
import '@waldoapp/wdio-service';

export const config: WebdriverIO.Config = {
  // This is done automatically if no key is provided,
  // the WALDO_API_TOKEN environment variable is used
  key: process.env.WALDO_API_TOKEN,

  services: [
    [
      '@waldoapp/wdio-service',
      {
        showSession: true,
      },
    ],
  ],
};
```

In order to run, you must upload your application binary to Waldo. A successful upload generates a build version ID of
the form `appv-0123456789abcdef`. This version ID must then be provided in either the `versionId` option, or the
`appium:app` capability field for Appium compatibility.

You do _not_ need to provide the `versionId` if instead you specify an existing running session with the `sessionId`
option.

## Waldo service options

To authorize the Waldo service your configuration _must_ contain a token for example in the
[`key`](https://webdriver.io/docs/options#key) option.

### token

The security token.

This can also be specified with either `key` in the test runner options, or the `WALDO_API_TOKEN` environment variable.

Type: `string` <br/>
Default: `undefined`

### showSession

Opens the Waldo interactive session viewer in a browser when the test is started.

This option has no effect when the `sessionId` option is specified.

Type: `boolean` <br/>
Default: `false`

### waitSessionReady

Waits for the session to be fully ready, and the application launched, before starting the test. Otherwise, the test
starts as soon as the device is available.

Type: `boolean` <br/>
Default: `true`

### sessionId

The ID of an existing Waldo session (created via `Sessions > Live > Start session`) to connect to. This is useful for interactive development.

The session ID can also be specified with the `WALDO_SESSION_ID` (or `SESSION_ID`) environment variable.

Type: `string` <br/>
Default: `undefined`

### versionId

The ID of the app (build) version to use for the test session (for example, `appv-0123456789abcdef`).

The version ID can also be specified with the `WALDO_APP_VERSION_ID` (or `VERSION_ID`) environment variable.

For Appium compatibility, this option can also be specified in the `appium:app` capability field.

Type: `string` <br/>
Default: `undefined`

## Device capabilities

Most of the service options can also be specified in the capabilities object for a specific device inside the
`waldo:options` key:

```ts
capabilities: [
  {
    platformName: 'Android',
    deviceName: 'Pixel 3a',
    'waldo:options': {
      showSession: true,
    },
  },
];
```

### waldo:automationName

This option can also be specified as `appium:automationName`.

For compatibility, the default behavior of the Waldo service is to return a tree similar to the one returned by Appium,
this is the equivalent of providing `UiAutomator2`, `UiAutomator2` or `Appium` as the automation name.

This makes it easy to port existing Appium scripts to Waldo but is based mainly on the accessibility view of the
application.

The `Waldo` automation name can also be used to enable same mode that is used by Waldo Automate. In this mode the tree returned is typically _more complete_ as it unifies native elements, Web views, React Native, and Flutter elements.

The `Waldo` automation name is required to use some of the additional commands added by this service like
`getWaldoTree`, `getNodes` and `tapElementWith`.

Type: `string` <br/>
Default: `Appium`

### deviceName

Placed inside the `waldo:options` object:

```ts
'waldo:options': {
  deviceName: 'Pixel 3a',
},
```

The name of the device to use for the test session (for example, `iPhone 15` or `Pixel 7`).

If this option is not specified, the default device configured for the app in Waldo is used.

Type: `string` <br/>
Default: `undefined`

### osVersion

Placed inside the `waldo:options` object:

```ts
'waldo:options': {
  osVersion: '17.0',
},
```

The operating system version to use (for example, `17.0` or `33.0`).

If this option is not specified, the default device configured for the app in Waldo is used.

Type: `string` <br/>
Default: `undefined`
