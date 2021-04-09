# DocMaps

A community-endorsed framework for representing research object-level (e.g. journal article, preprint, or dataset) review/editorial processes in a machine-readable, discoverable, and extensible format.

More info: https://docmaps.knowledgefutures.org

## About This Repo

This repo defines a basic initial schema using JSON schema, a validation tool, and two example schemas for a review and author response based on https://sciety.org/articles/activity/10.1101/2020.12.15.422694

The schema includes annotation and definition. Also included are two annotated schemas (invalid JSON, but quite helpful), which provide more details about the thinking of specific fields in DocMaps.

## Usage

`npm run validate -- --docmap ./path-to-file.json`

Try it out with:

`npm run validate -- --docmap ./review.json`

## To Do

- Fix schema to include anyOf "#", "docmap" in required
- Add isAuthorResponseTo property
- Break the schema out into its own file
- Expand the schema to accomadate more examples
- Better validation of domains for providers (right now using URI validation)
