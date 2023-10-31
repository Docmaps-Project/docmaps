# Official Docmaps Widget

_Note: This is still a work in progress and should not yet be used in any production context._

An embeddable widget for displaying docmaps data, built with Lit and D3.

## Usage

### Run the server locally

```shell
pnpm run dev
```

This starts the server on http://localhost:5173

### Testing

The first time you run the tests, you will need to install browsers for Playwright to use

```shell
pnpm run install:browsers
```

After that, you can run the tests with

```shell
pnpm run test
```

To see the tests run visually, step-by-step, you can open the Playwright UI like this:

```shell
pnpm run test:ui
```
