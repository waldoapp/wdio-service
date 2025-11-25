# Contributing

## Prerequisites

- Node.js with the version specified in `.nvmrc`

## Development

1. Clone the repository
2. Install the dependencies

   ```sh
   nvm use # If you use nvm
   corepack enable
   pnpm install
   ```

3. Do the changes you want to make
4. Run the tests and all checks done by the CI

   ```sh
   pnpm run ci
   ```

5. Submit a pull request
