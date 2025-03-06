## Version 1.1.1

- Add the `interceptNetwork` capability

## Version 1.1.0

- Add the `waldo:` prefixed capability variants to the types
- Add the `coordinateMode` capability
- Upgrate to `open` version 10 (From 8)

## Version 1.0.0

- Support both WebDriverIO v8 and v9

## Version 0.2.5

- Fix configuration precedence, ensure that environment variables always take precedence over the configuration file.

## Version 0.2.4

- Fix horizontal swipe coordinate calculation in `swipeScreen`

## Version 0.2.3

- Fix `waitForElement` to handle more `findElement` return values
- Remove dependency on `lodash`

## Version 0.2.2

- Include more documentation in the readme

## Version 0.2.1

- Depend on `sax` at `^1.0.0` instead of `^1.4.1`
- Fix error when importing `sax` at runtime
- Add types to commands returning waldo tree elements
- Move `webdriverio` to a peerDependency

## Version 0.2.0

- Add `waldo:automationName` to capabilities and document it's usage.
- Migrate operations on waldo tree to the new XML format returned by the server.

## Version 0.1.8

- Fix local development configuration (Internal)
- Document the `waldo:displayName` key in capabilities

## Version 0.1.7

- Various fixes to exported type definitions

## Version 0.1.6

- Fix crash in the `screenshot` custom command.

## Version 0.1.5

- Change `waitSessionReady` default value to true.
- Add a waldo-auth binary to setup `~/.waldo/profile.yml` with the user's token.<br>
  It can be used with `npm exec waldo-auth [TOKEN]`
