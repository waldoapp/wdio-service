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
