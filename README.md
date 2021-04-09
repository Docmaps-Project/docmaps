# DocMaps

A community-endorsed framework for representing research object-level (e.g. journal article, preprint, or dataset) review/editorial processes in a machine-readable, discoverable, and extensible format.

More info: https://docmaps.knowledgefutures.org

## About This Repo

This repo defines a basic initial schema using JSON schema, a validation tool, and two example schemas based on https://sciety.org/articles/activity/10.1101/2020.12.15.422694

The schema includes annotation and definition. Also included are two annotated schemas (invalid JSON, but quite helpful), which provide more details about

## Using

Clone the repo, change the imported schema in `index.js` to the one you want to validate, and run `npm run validate`.

## To Do

- Make the validation command more useful by allowing you to specify the schema to validate against
- Fix schema to include anyOf "#", "docmap" in required
- Add isAuthorResponseTo property
- Break the schema out into its own file
- Expand the schema to accomadate more examples
- Better validation of domains for providers (right now using URI validation)
