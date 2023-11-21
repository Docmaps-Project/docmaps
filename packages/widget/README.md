# Official Docmaps Widget

_Note: This is still a work in progress and should not yet be used in any production context._

An embeddable widget for displaying docmaps data, built with Lit and D3.

## Usage

### Running the server locally

```shell
pnpm run dev
```

This starts the server on http://localhost:5173

### Running the tests

The first time you run the tests, you will need to install browsers for Playwright to use

```shell
pnpm run install:browsers
```

#### All tests

```shell
pnpm run test
```

#### Unit tests

```shell
pnpm run test:unit
```

#### Integration tests

To see the tests run in step-by-step, you can open the Playwright UI like this. The Playwright UI is an amazing tool
because it lets you see screenshots of each step of the test, and it automatically reruns the tests when you make
changes.

```shell
pnpm run test:integration:ui
```

Alternatively, you can run the tests headlessly and see results in the terminal:

```shell
pnpm run test:integration
```

By default, the tests only run in chromium locally. To run in chromium, firefox, and webkit, you can run:

```shell
# Headless
pnpm run test:integration:all-browsers

# With UI
pnpm run test:integration:ui:all-browsers
```
