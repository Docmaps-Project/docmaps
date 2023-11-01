# Runtime - the core server

This package contains all the code necessary to run the API server on your own, including superficial options for storage.

The package/server is structured like this:

| Layer | Notes |
| - | - |
| _NodeJS Client_ | Generated from [`ts-rest`](https://ts-rest.com/). See `src/client.ts`. May be extracted to a separate package in this repository. |
| HTTP webserver | using [express.js](https://expressjs.com/), fulfills contract described in [the RFC for this server](https://github.com/Docmaps-Project/rfcs/blob/ships/1/APIProtocol/proposals/001_interop.md) |
| Node API Instance | fulfills contract spec of the RFC in nodejs library. `src/api.ts` |
| Adapter layer | Separates the dataset adapter from the API instance for example, isolates auth from data `src/adapter/` |
| SPARQL processor/adapter | converts Docmaps semantics to SPARQL and uses `docmaps-sdk` to make objects from triples | 
| SPARQL triplestore | Anything that supports SPARQL is allowed, we supply easy access to [oxigraph](https://github.com/oxigraph/oxigraph) |

Note that use of SPARQL is optional but you would be required to write your own `BackendAdapter` layer that translates
domain logic into queries for your specific backend (such as a relational database).

## Development and Testing

Dependencies for local development include:

```
pnpm
node # @^18
docker # with docker-compose available
curl
```

To begin with this package, in this directory run:

```bash
pnpm install
pnpm test:unit
pnpm test:integration
```

**WARN:** If you have never done this before, the tests may timeout due to invoking a `docker pull` for the `oxigraph` image, which
is used for a local triplestore to use during integration tests.

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

### Misc

See CONTRIBUTING.md for guidelines (see repository root).

Licensed according to the Knowledge Futures, Inc standard license (see repository root).

Special thanks to all OSS teams and contributors who helped with this project or its dependencies,
especially but in no way limited to [express](https://expressjs.com/),[ts-rest](https://ts-rest.com/),[oxigraph](https://github.com/oxigraph/oxigraph)

