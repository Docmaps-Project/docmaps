# Extract-Transform-Load CLI for Docmaps

This typescript library is designed to provide core, highly-general docmaps
functionality for ease-of-use in Typescript. It provides out-of-the-box
validation of JSON-LD documents interpreted as docmaps directly. It is intended
to additionally support validation of Docmap sub-elements, such as individual
Actions or Actors that might be published separately from a whole Docmap. It
will also be integrated into concrete tools such as a docmap-from-meca ETL pipeline
and general visualization tools.

## Implementation

This tool and library are written using the [`docmaps-sdk` package](/packages/ts-sdk)
in this repository, as well as the [`crossref-openapi-client-ts`](https://github.com/Docmaps-Project/crossref-openapi-client-ts)
also maintained by Knowledge Futures, Inc. As seen in `src/crossref.ts`[src/crossref.ts],
Codecs from the SDK are processed using functional paradigms provided conveniently by
`fp-ts`.

## Documentation

Documentation is comments-only for now. See [relevant issue](https://github.com/Docmaps-Project/docmaps/issues/20).

## Contributing

For Code of Conduct, see the repository-wide [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md).

For info about local development of this repository, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Current next steps

Review the issues on this repository for up-to-date info of desired improvements.
There are also expressive TODOs in the codebase.
Here are some examples:

- [ ] Enable direct configuration of the publisher information for generated Docmaps
- [ ] Handle paginated requests for efficient parallel processing.
- [ ] Make the ETL interface generic enough to handle at least one other data source than Crossref.
