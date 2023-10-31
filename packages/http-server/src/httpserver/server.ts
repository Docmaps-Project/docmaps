import express, { Application } from 'express'
import { createServer as createHttpServer, Server as ServerHttp } from 'http'
import { Server as ServerHttps } from 'https'
import { initServer, createExpressEndpoints } from '@ts-rest/express'
import { contract } from '@docmaps/http-client'
import { ApiInstance } from '../api'
import { OxigraphInmemBackend } from '../adapter/oxigraph_inmem'
import { SparqlAdapter, SparqlFetchBackend } from '../adapter'
import { isLeft } from 'fp-ts/lib/Either'
import { BackendAdapter } from '../types'
import cors from 'cors'

export type ServerConfig = {
  server: {
    port: number
    apiUrl: string
  }
  backend:
    | {
        type: 'sparqlEndpoint'
        sparqlEndpoint: {
          url: string
        }
      }
    | {
        type: 'memory'
        memory: {
          baseIri: string
        }
      }
}

// TODO: rename?
export class HttpServer {
  api: ApiInstance
  app: Application
  server: ServerHttp | ServerHttps // FIXME : support https
  config: ServerConfig

  constructor(config: ServerConfig) {
    this.config = config

    let adapter: BackendAdapter
    switch (config.backend.type) {
      case 'memory':
        adapter = new SparqlAdapter(new OxigraphInmemBackend(config.backend.memory.baseIri))
        break
      case 'sparqlEndpoint':
        adapter = new SparqlAdapter(new SparqlFetchBackend(config.backend.sparqlEndpoint.url))
        break
    }

    this.api = new ApiInstance(adapter, new URL(config.server.apiUrl))

    this.app = express()

    // TODO Allow CORS to be configured in production
    this.app.use(cors())

    // app.use(bodyParser.urlencoded({ extended: false }))
    // app.use(bodyParser.json())

    const s = initServer()

    const router = s.router(contract, {
      getInfo: async () => {
        const info = this.api.get_info()

        return {
          status: 200,
          body: info,
        }
      },
      getDocmapById: async (req) => {
        const iri = decodeURIComponent(req.params.id)
        const result = await this.api.get_docmap_by_id(iri)()

        if (isLeft(result)) {
          return {
            status: 501, // FIXME: more expressive errors.
            body: result.left,
          }
        }

        return {
          status: 200,
          body: result.right,
        }
      },
      getDocmapForDoi: async (req) => {
        const doi = req.query.subject
        console.log(doi)
        const result = await this.api.get_docmap_for_thing({ identifier: doi, kind: 'doi' })()

        if (isLeft(result)) {
          return {
            status: 404, // FIXME: more expressive errors.
            body: result.left,
          }
        }

        return {
          status: 200,
          body: result.right,
        }
      },
    })

    // FIXME: resolve this awkward use of typescript ignores. The only
    // reason I am willing to do this temporarily:
    // - this function call doesn't affect any types as far as I can tell
    // - it seems related to known issues in Zod, dependency of ts-rest
    // - I have an open issue to track: https://github.com/ts-rest/ts-rest/issues/389

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    createExpressEndpoints(contract, router, this.app)
    this.server = createHttpServer(this.app)
  }

  listen(): Promise<void> {
    return new Promise((res, _rej) => {
      // TODO : set listen timeout handling
      this.server.listen(this.config.server.port, () => {
        // console.log(`Listening at http://localhost:${config.server.port}`)
        res()
      })
    })
  }

  close(): Promise<void> {
    return new Promise((res, _rej) => {
      // TODO : set close timeout handling
      this.server.close(() => {
        // console.log(`Closing server...`)
        res()
      })
    })
  }
}
