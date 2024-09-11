# WebdriverIO Waldo Service

[![NPM](https://img.shields.io/npm/v/%40waldoapp%2Fwdio-service)](https://www.npmjs.com/package/@waldoapp/wdio-service)
[![CI](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml/badge.svg)](https://github.com/waldoapp/wdio-service/actions/workflows/build.yaml)

A [WebdriverIO](https://webdriver.io/) service that provides better integration with
[Waldo](https://www.waldo.com/scripting).

This package provides:

- Automatic configuration of Waldo as the webdriver endpoint.
- A collection of additional commands to ease mobile testing.
- A TypeScript definition for the options and mobile-specific capabilities.

Table of contents:

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Waldo service options](#waldo-service-options)
- [Additional commands](#additional-commands)

## Requirements

- Node.js version 18 or later
- WebdriverIO version 8
- A Waldo account: [sign up here](https://app.waldo.com/register)

## Installation

### Starting from a sample project

The easiest way to get started with this package if you aren't already using WebDriverIO is to clone the
[sample repository](https://github.com/waldoapp/waldo-programmatic-samples) and follow the instructions
[directly in Waldo](https://app.waldo.com/applications/0/sessions?guide=wikipedia-programmatic) or in it's
[readme](https://github.com/waldoapp/waldo-programmatic-samples/blob/main/README.md).

### Starting from scratch

Full instructions on how to install `WebdriverIO` can be found [here](https://webdriver.io/docs/gettingstarted),
but the easiest way is to use the CLI:

```sh
npm init wdio@latest .
```

Here are the steps to follow for an optimal configuration with Waldo
(The only steps listed are the one that affect Waldo usage, the rest of the configuration is up to you):

- _What type of testing would you like to do?_<br />
  **E2E Testing - of Web or Mobile Applications**
- _Where is your automation backend located?_<br />
  **On my local machine** (We'll switch to Waldo later)
- _Which environment you would like to automate?_<br />
  **Mobile - native, hybrid and mobile web apps, on Android or iOS**
- _Which mobile environment you'ld like to automate?_<br />
  **Android** (We won't use the package but it's required)
- _Do you want to add a service to your test setup?_<br />
  **Remove appium that was added by default**
- _Continue with Appium setup using appium-installer?_<br />
  **No**

You'll get a project where you can remove the automatically added `appium-uiautomator2-driver`:

```sh
npm uninstall @wdio/appium-service appium-uiautomator2-driver
```

You can then proceed to [add Waldo to the project](#in-an-existing-webdriverio-project).

### In an existing WebDriverIO project

To add this package in an existing WebDriverIO project is to add the `@waldoapp/wdio-service` package as a
`devDependency` in your `package.json`:

```sh
npm install @waldoapp/wdio-service --save-dev
```

If you use TypeScript you'll also need to reference package for the types to be available,
in `tsconfig.json` add `@waldoapp/wdio-service` to the types array:

```json
{
  "compilerOptions": {
    "types": [
      "node",
      // <snip>
      "@waldoapp/wdio-service"
    ]
  }
}
```

The next step would be to [configure the package](#configuration).

## Configuration

### Sample configuration file

```ts
// wdio.conf.ts
export const config: WebdriverIO.Config = {
  // This is only for illustration purposes,
  // this is done automatically if no key is provided,
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

  capabilities: [
    {
      platformName: 'Android',
      // 'wiki' targets the sample Wikipedia application
      // Replace with your application version ID
      'appium:app': 'wiki',
      'waldo:options': {
        deviceName: 'Pixel 7',
      },
    },
  ],

  mochaOpts: {
    // The default value is pretty low for mobile testing
    timeout: 10 * 60 * 1000,
  },
};
```

### Authentication

To use the Waldo service, you need to provide a valid Waldo API token.
This token can be specified by defining the `WALDO_API_TOKEN` environment variable,
or by including the `key` option in your `wdio.conf.ts` file.

The API token can be either a user-scoped token for development found in the
[“Profile” tab of your Waldo account settings](https://app.waldo.com/settings/profile), or an application-scoped CI
token found in the [“General” tab of the “Configuration”](https://app.waldo.com/applications/0/configurations/general)
for your app.

On developer machines the token can also be stored in a local profile `~/.waldo/profile.yml` and is automatically picked
up, a script is provided in this package to fill it:

```sh
npx waldo-auth [YourToken]
```

### Specifying the application binary/build to target

In order to run, you must upload your application binary to Waldo.
To do so, follow the instructions on the [Upload page](https://app.waldo.com/applications/0/builds/upload) while
logged in or check [the documentation](https://docs.waldo.com/docs/upload-a-build).

A successful upload generates a build version ID of the form `appv-0123456789abcdef` that can be copied via the
`Copy build id` option in the 3 dots menu on the web and that is provided in the output when the CLI is used to
upload.

This version ID must then be provided in either the `versionId` option, or the `appium:app` capability.

You do _not_ need to provide the `versionId` if instead you specify an existing running session with the `sessionId`
option (The application version and device type are selected when the session is started).

## Usage

When you execute a script that uses Waldo Scripting, the script always uses a remote device session on a
simulator/emulator running within the Waldo infrastructure.

There are multiple ways to start a session depending on if you are developing a new script,
running tests locally to verify a change or running the test during Continuous Integration (CI).

### Interactive execution

In this mode, your script interacts with an ongoing remote session that _remains alive_
when execution reaches the end of the script.

In order to run in this mode, you must first launch a session manually in Waldo by going to
the [Live view](https://app.waldo.com/applications/0/sessions) and starting a session.

As long as this session remains alive, you can execute your script against it.
To do so you need to provide the session ID that can be obtained by using the `Use for script`
button of the `Info` tab or from the URL (they are prefixed with `sess-`, such as `sess-1234567890abcdef`).

```shell
SESSION_ID=[SessionID] npm run wdio -- --spec [YourScript]
```

> ℹ️ **Note**
>
> in this mode, it is not necessary to specify `VERSION_ID` since the remote session was already
> started with a specific app version.

> ⚠️️ **Warning**
>
> If you have multiple test files and don't specify a `--spec` option, all of them will be executed at the
> same time, on the **SAME** device session.

This mode is very useful for creating a new script or editing an existing one, since it allows you
to quickly relaunch your app over and over without waiting for session initialization. In addition,
this mode also allows you to perform some actions manually on the session in the browser, as well
as use the tree inspector to determine the best way to locate an element.

### Live execution

In this mode, your script interacts with a freshly created remote session, where you can
watch its execution in a browser in real time.

It is enabled by setting the `SHOW_SESSION` environment variable to `1`:

```shell
VERSION_ID=[VersionID] SHOW_SESSION=1 npm run wdio -- --spec [YourScript]
```

> 💡 **Tip**
>
> It's often better to always specify a single test file via the `--spec` option to avoid a
> lot of browser tabs openning at the same time.

This mode is very useful when you want to watch the current behavior of a script against a new
application version or to reproduce an issue noticed in CI.

### Background execution

In this mode, your script interacts via Waldo Scripting with a freshly created remote
session that is killed when execution reaches the end of the script.

You do not have any visual feedback of what is happening; however, you can watch
the replay of the execution at a later time.

It is the default mode and simply needs a version ID to target:

```shell
VERSION_ID=[VersionID] npm run wdio
```

This is the most common mode of execution when you have a full suite of scripts to run in parallel
(for instance from your CI).
In such a case, you are usually only interested in accessing the session replay of a script that
failed.

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

This option can also be configured by setting the `WALDO_SHOW_SESSION` (or `SHOW_SESSION`) environment variable to `1`.

Type: `boolean` <br/>
Default: `false`

### waitSessionReady

Waits for the session to be fully ready, and the application launched, before starting the test. Otherwise, the test
starts as soon as the device is available.

Type: `boolean` <br/>
Default: `true`

### sessionId

The ID of an existing Waldo session (created via `Sessions > Live > Start session`) to connect to.
This is useful for interactive development.

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
    'waldo:options': {
      deviceName: 'Pixel 3a',
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

The `Waldo` automation name can also be used to enable same mode that is used by Waldo Automate.
In this mode the tree returned is typically _more complete_ as it unifies native elements, Web views, React Native,
and Flutter elements.

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

### Language

To set the language for a session you can use the `appium:language` capability.
This key allows you to specify the language in which the app will run during the session.

```ts
{
  "capabilities": [{ "appium:language": "fr" }]
}
```

Please not that each device supports a different set of languages. To determine which languages a specific device supports, you can make a call to the []`GET /devices` endpoint](https://docs.waldo.com/reference/getdevices) on `https://core.waldo.com` and check `supportedLanguages`.

Type: `string` <br/>
Default: `en`

## Additional commands

In addition to configuring Waldo as a remote WebDriver endpoint this package also adds the following commands on the
driver object:

### waitForElement

Wait until an element appears that has the `property` equal to `value` and returns it.

An error will be thrown if the element can't be found after the timeout.

Example:

```ts
const element = await driver.waitForElement('text', 'Hello, World!');
```

Parameters:

- `property` Name of the property to match on elements
- `value` Expected value of the property
- `timeout` Maximum time in milliseconds to wait for the element to appear. Default to `5000`.
- `delay` Interval in milliseconds between checks for the element. Default to `500`.
- `waitForStability` If enabled wait for the element position to stabilize before tapping. Default to `false`.

### tap

Simulate a 'tap' gesture at the given coordinates.

This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerUp`.

Example:

```ts
await driver.tap(100, 100);
```

### tapElement

Wait until an element appears that has the `property` equal to `value` and then tap on it.

An error will be thrown if the element can't be found after the timeout.

Example:

```ts
await driver.tapElement('text', 'Skip');
```

- `property` Name of the property to match on elements
- `value` Expected value of the property
- `timeout` Maximum time in milliseconds to wait for the element to appear. Default to`5000`.
- `delay` Interval in milliseconds between checks for the element. Default to `500`.
- `waitForStability` If enabled wait for the element position to stabilize before tapping. Default to`false`.

### tapElementWith

Wait until an element appears that matches the predicate in the Waldo tree and then tap on it.

An error will be thrown if the element can't be found after the retries.

Example:

```ts
await driver.tapElementWith((n) => n.text === 'Skip');
```

> ℹ️ **Note**
>
> This command is only available when using the Waldo automation via the
> `'waldo:automationName': 'Waldo'` capability.

- `predicate` A function that returns `true` for the element to tap on
- `position` Index of the element to match if there are multiple matches, or `'first'` or `'last'`. Default to `0`.
- `retries` Maximum number of retries to find the element. Default to`3`.
- `delay` Interval in milliseconds between retries. Default to`500`.

### typeInElement

Wait until an element appears that has the `property` equal to `value` and then type `text` in it.

An error will be thrown if the element can't be found after the timeout.

Example:

```ts
await driver.typeInElement('placeholder', 'email address', 'test@example.com');
```

- `property` Name of the property to match on elements
- `value` Expected value of the property
- `text` The text to type in the element
- `timeout` Maximum time in milliseconds to wait for the element to appear. Default to`5000`.
- `delay` Interval in milliseconds between checks for the element. Default to`500`.
- `waitForStability` If enabled wait for the element position to stabilize before tapping. Default to`false`.

### tapCenterOfBox

Simulate a 'tap' gesture at the center of the given bounding box.

Example:

```ts
const box = await driver.getNodes((n) => n.text === 'Skip')[0];
await driver.tapCenterOfBox(box);
```

### getNodes

Get all nodes in the Waldo tree that match the given predicate

> ℹ️ **Note**
>
> This command is only available when using the Waldo automation via the
> `'waldo:automationName': 'Waldo'` capability.

Example:

```ts
const okButtons = await driver.getNodes(
  // Find all nodes with a text that contains 'ok' case insensitive
  (n) => n.text && n.text.match(/ok/i) !== null,
);
```

### getWaldoTree

Parse the current Waldo tree returned by `getPageSource()` and return it as a JSON object.

> ℹ️ **Note**
>
> This command is only available when using the Waldo automation via the
> `'waldo:automationName': 'Waldo'` capability.

### swipeScreen

Simulate a 'swipe' gesture in the given direction.

The default movement without any options is a horizontal swipe from right (`95`) to left (`5`).

This is equivalent to the following actions: `pointerMove`, `pointerDown`, `pause`, `pointerMove`, `pointerUp`.

Example:

```ts
// Swipe from top to bottom
await driver.swipeScreen('vertical', 10, 90);
```

Parameters:

- `direction`: The direction of the swipe, either `vertical` or `horizontal`. Default to `horizontal`.
- `fromScreenPercent`: The starting point of the swipe as a percentage of the screen size. Default to `95`.
- `toScreenPercent`: The ending point of the swipe as a percentage of the screen size. Default to `5`.

### screenshot

A simplified wrapper around the `saveScreenshot` command that saves the screenshot to a file in the
`./screenshots/` directory, creating it if necessary.

> ℹ️ **Note**
>
> If an absolute path is provided, this function is equivalent to calling `saveScreenshot`
> directly.

Example:

```ts
// Final path will be ./screenshots/screenshot.png
await driver.screenshot('screenshot.png');
```

### log

Send a log line that will be visible in the Waldo Session Viewer

Example:

```ts
await driver.log('Found logged in user', { name: detectedUserName }, 'debug');
```

Parameters:

- `message`: The message to log
- `payload`: Additional data to log that will be visible when the log line is selected. Default to `{}`.
- `level`: The log level, one of `debug`, `info`, `warn`, or `error`. Default to `info`.
