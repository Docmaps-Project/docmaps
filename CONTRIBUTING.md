# Contribution guide

This is a living document with helpful context for development workflows related
to this project. It is not comprehensive, we invite you to request clarifications
about any topic that is underspecified here!

### Running the http-server locally

The server can be started locally from a local rebuild of source code using:

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
