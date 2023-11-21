# Docmaps

A community-endorsed framework for representing research object-level (e.g. journal article, preprint, or dataset)
review/editorial processes in a machine-readable, discoverable, and extensible format.

More info: https://docmaps.knowledgefutures.org

## About This Repo

This repo contains JSONLD contexts and framing for Docmaps.

It also contains the Typescript-based libraries (initially, just `packages/ts-sdk`) for use with Node.js.

### Monorepo usage

This repository is an NPM Module Monorepo. This top-level directory includes no distributed packages, but some reference
material as well as automation scripts for the
cross-package behavior, such as release automation.

**Releases and tags:** Github Actions uses [multi-semantic-release](https://github.com/dhoulb/multi-semantic-release) to
automatically generate semvers based on commit history for each package in the repository. Multiple tags
are generated for a single commit if it updates multiple packages.

**Cross-dependencies and typescript:** Several packages depend on `ts-sdk`, and will refer to
the `dist` directory within that package for their source code when making local changes.
For that reason, you may need to run `pnpm run build:deps` in a package, or `pnpm run -r build`
to build all packages, if you are making local changes to uptream dependencies within this
monorepo so that your downstream code changes will pull those in.

**Dependencies:** The workspace root builds a Docker image for the http-server. In addition to the
npm package dependencies, to do local development you should have the following tools installed:

```bash
pnpm # @^8.7
node # @^18
docker # with docker-compose available
```

see [CONTRIBUTING.md](/CONTRIBUTING.md) for more info about local development.

## Persistent URLs

Documentation: https://w3id.org/docmaps

Latest @context: https://w3id.org/docmaps/context.jsonld

## Packages

### [ts-sdk](/packages/ts-sdk)

This package contains a library of JSON-parsing and string-parsing codecs based on
`io-ts`, and associated Typescript types. These types can be used without `io-ts`, but
that library natively integrates with `fp-ts` and enables easy encoding & decoding
from raw data types at runtime by creating Prototypical classes in runtime namespace
along with the types/interfaces in type namespace.

### [http-server](/packages/http-server)

This package is a Node server that serves docmaps. It is the Typescript
reference implementation of Docmaps Project RFC#001 API Server Interoperability Protocol.

### [ts-etl](/packages/ts-etl)

This package contains a CLI tool based on `commander.js` for generating docmaps. Currently,
it supports generating a docmap for a given DOI if that DOI is indexed on Crossref, and
will traverse the Crossref API to find related preprints and reviews for that DOI. It is
still in a pre-release state while we gather feedback.

### [SPA](/packages/spa)

This Single-page App (SPA) is a simple demonstration of the above tools in action. It is
accessible [live on Github Pages](https://docmaps-project.github.io/docmaps/demo/) where you can
plug in a DOI and get a best-effort view of a Docmap as inferred from Crossref's API.

### [Widget](/packages/widget)

This package contains a web component that can be embedded in any webpage to display a docmap.

## Governance

As stated in [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md):

This project is governed by
the [Knowledge Futures, Inc Organizational Code of Conduct](https://github.com/knowledgefutures/general/blob/master/CODE_OF_CONDUCT.md).
