# Docmaps

A community-endorsed framework for representing research object-level (e.g. journal article, preprint, or dataset) review/editorial processes in a machine-readable, discoverable, and extensible format.

More info: https://docmaps.knowledgefutures.org

## About This Repo

This repo contains JSONLD contexts and framing for Docmaps.

It also contains the Typescript-based libraries (initially, just `packages/ts-sdk`) for use with Node.js.

### Monorepo usage

This repository is an NPM Module Monorepo. This top-level directory includes no distributed packages, but some reference material as well as automation scripts for the
cross-package behavior, such as release automation.

**Releases and tags:** Github Actions uses [multi-semantic-release](https://github.com/dhoulb/multi-semantic-release) to automatically generate semvers based on commit history for each package in the repository. Multiple tags
are generated for a single commit if it updates multiple packages.

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


## Running the http-server locally with Docker and Oxigraph

The http-server can be started locally from a local rebuild of source code using:

```bash
pnpm compose:up
```

This will start the server listening on `localhost:8080` with a service container
running a fresh Oxigraph graph store backend listening on `locahost:33378`. Note
that the store will initialize empty, but store its data persistently at `tmp/oxigraph_data`
so that you can upload data and continue to reuse it between launches of the app.

**Seeding data to the graph store:** You can use the script `scripts/upload_to_local_deployment.ts`,
which ingests any JSON-LD document from standard in and emits triples to the docker-compose
Oxigraph backend (requires the composed cluster to be running). You can set the environment variable
`DM_DEV_OXIGRAPH_URL` to something other than `http://localhost:33378` (the default) if you are trying
to write to some other Oxigraph location.

**WARNING** because of the [algebraic properties of blank nodes](https://docmaps.knowledgefutures.org/pub/eqb8u4v0/release/2),
SPARQL Update protocol does not support idempotent writes. If you upload the same document multiple times,
all blank nodes and associated triples will be presumed unique in relation to previous uploads
of "similar seeming" blank nodes, and will result in duplication in the dataset. Named nodes will
not be duplicated. For example, Steps and Actions are usually blank nodes, but Docmaps have ids.
This means that if you upload a typical json-ld Docmap twice, all the steps will be doubled. If an
action has an ID, then every copy of a step will point to it, whereas if not, there will be a copy
of the action.

To upload a docmap, pipe/redirect to the script's stdin. For example, [this docmap from github](https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld):

```bash
curl -s https://raw.githubusercontent.com/Docmaps-Project/docmaps/main/examples/docmaps-example-elife-02.jsonld \
  | npx tsx scripts/upload_to_local_deployment.ts
```

There is example with a local file:

```bash
<my_docmap.jsonld npx tsx scripts/upload_to_local_deployment.ts
```

To confirm that there are docmaps in the store, you can visit `http://localhost:33378` (or whatever you customized
the Oxigraph backend to serve at). You should see a SPARQL Query prompt and can explore. For example,
you can submit this query to see how many nodes are of type `pwo:Workflow` (equivalent to `"type": "docmap"` in jsonld):

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX pwo: <http://purl.org/spar/pwo/>
SELECT (COUNT(*) as ?docmaps) WHERE {
  ?docmaps rdf:type pwo:Workflow .
}
```

To remove all uploads if your state gets contaminated or you want to start over:

```bash
pnpm compose:repave
# must restart oxigraph or entire compose cluster to ensure changes take effect
```


## Governance

As stated in [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md):

This project is governed by the [Knowledge Futures, Inc Organizational Code of Conduct](https://github.com/knowledgefutures/general/blob/master/CODE_OF_CONDUCT.md).
