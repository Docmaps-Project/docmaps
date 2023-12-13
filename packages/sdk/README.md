> DEPRECATION NOTICE: the NPM package `docmaps-sdk` has been moved to `@docmaps/sdk`.
>   (the source code still lives here.)
>   Update your installs and imports accordingly.

# Typescript SDK for Docmaps

This typescript library is designed to provide core, highly-general docmaps
functionality for ease-of-use in Typescript. It provides out-of-the-box
validation of JSON-LD documents interpreted as docmaps directly. It is intended
to additionally support validation of Docmap sub-elements, such as individual
Actions or Actors that might be published separately from a whole Docmap. It
will also be integrated into concrete tools such as a docmap-from-meca ETL pipeline
and general visualization tools.

## Implementation

The core types are written using [`io-ts`](https://github.com/gcanti/io-ts), whose
expressive language defines codecs for validation, encoding and decoding of objects
between various types.

These codecs are then used to extract the Typescript interfaces that most narrowly
describe their parsed outputs. Optional fields are described using `t.partial`, whereas
required fields are described using `t.type`. `t.intersection` allows both required and
optional fields. None of these types will fail to parse due to extra keys present, but those
keys will be dropped. We can disallow extra keys using `t.exact`.

Any codec can be used directly with a JSON string or `any`/`unknown` object to try and
create the instantiation of the Typescript type. `io-ts` is designed to work with
[`fp-ts`](https://github.com/gcanti/fp-ts), so you get an instance of Either which must
be deconstructed by case to determine whether the input was valid. See examples of this
in the [`typed_graph`](https://github.com/Docmaps-Project/docmaps/blob/main/packages/sdk/src/typed_graph.ts),
where we use `isLeft` to check if the decode failed.

**For examples of usage of `fp-ts` pipelines with our `io-ts` codecs, review the
[`ts-etl` implementation](https://github.com/Docmaps-Project/docmaps/blob/main/packages/ts-etl/src/plugins/crossref/api.ts).

### Extended usage with `typed_graph`

Alternatively, the `typed_graph` class is used for choosing the codec to use based on the
`@type` key present in the jsonld. This is mainly here to support to-be-implemented RDF
use-cases rather than JsonLD use cases, because it only works when the `@type` field is set
the input objects, which we generally do not expect except in `Docmap` and `Manifestation`
at the moment. Generally I recommend you to ignore `typed_graph` until further development
makes it more useful.

A utility function is available on the `TypedGraph` class that can ingest an RDF Quad stream
and return a TaskEither that will eventually resolve to a JSONLD object or error. It is async,
and not time-bound, and so is not recommended for production use at the current time. However
it does allow type-safe extraction of Docmaps from unstructured in-memory triplestores, such
as the results of a SPARQL query.

## Documentation

Documentation is [served by github pages](https://docmaps-project.github.io/docmaps/docmaps-sdk/index.html).
If you wish to view documentation for an off-branch edition of this package, the directory `/docs`
can be populated by the command `pnpm docs:generate`. The inputs to the
generation script include all Markdown and source files in this directory. These docs are generated
dynamically during GH Pages release on merge to main, so the directory can be empty on check-in.

## Contributing

For Code of Conduct, see the repository-wide
[CODE_OF_CONDUCT.md](https://github.com/Docmaps-Project/docmaps/blob/main/CODE_OF_CONDUCT.md).

For info about local development of this repository, see
[CONTRIBUTING.md](https://github.com/Docmaps-Project/docmaps/blob/main/packages/sdk/CONTRIBUTING.md).

## Releases

Packages are hosted on NPM and automated by senmantic-release (see repository root for more info).

## Current next steps

Review the issues on this repository for up-to-date info of desired improvements.
There are also expressive TODOs in the codebase.
Here are some examples:

- [x] use more specific types in `io-ts-types` to validate that strings which should
be URLs and dates contain their respective value types.
- [ ] build out the typed-graph functionality to support parsing various types from streams.
- [ ] validate the semantics of docmaps, not just structure (i.e., the first-step refers to a real step).
