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

### Misc

See CONTRIBUTING.md for guidelines (see repository root).

Licensed according to the Knowledge Futures, Inc standard license (see repository root).

Special thanks to all OSS teams and contributors who helped with this project or its dependencies,
especially but in no way limited to [express](https://expressjs.com/),[ts-rest](https://ts-rest.com/),[oxigraph](https://github.com/oxigraph/oxigraph)

