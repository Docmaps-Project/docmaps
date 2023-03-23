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
in the [`typed_graph`](/packages/ts-sdk/src/typed_graph.ts), where we use `isLeft` to check if the decode
failed.

Alternatively, the `typed_graph` class is used for choosing the codec to use based on the
`@type` key present in the jsonld. This is mainly here to support to-be-implemented RDF
use-cases rather than JsonLD use cases, because it only works when the `@type` field is set
the input objects, which we generally do not expect except in `Docmap` and `Manifestation`
at the moment. Generally I recommend you to ignore `typed_graph` until further development
makes it more useful.

## Documentation

Documentation is comments-only for now. See [relevant issue](https://github.com/Docmaps-Project/docmaps/issues/20).

## Current next steps

Review the issues on this repository for up-to-date info of desired improvements.
There are also expressive TODOs in the codebase.
Here are some examples:

- [x] use more specific types in `io-ts-types` to validate that strings which should
be URLs and dates contain their respective value types.
- [ ] build out the typed-graph functionality to support parsing various types from streams.
- [ ] validate the semantics of docmaps, not just structure (i.e., the first-step refers to a real step).
