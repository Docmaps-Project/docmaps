import type { SparqlProcessor } from '.'
import oxigraph from 'oxigraph'
import type { Quad } from '@rdfjs/types'
import type { Construct, Describe } from '@tpluscode/sparql-builder'
import { arrayToAsyncIterable } from '../utils'
import * as TE from 'fp-ts/lib/TaskEither'

export class OxigraphInmemBackend implements SparqlProcessor {
  // inmem usage allows writes directly to memory, separate from
  // the query interface, if you have a handle to it.
  public store: oxigraph.Store
  base: string

  constructor(baseIRI: string) {
    this.store = new oxigraph.Store()
    this.base = baseIRI
  }

  triples(query: Construct | Describe): TE.TaskEither<Error, AsyncIterable<Quad>> {
    const qstr = query.build({ base: this.base }) // oxigraph is not type-safe in its return here, but it guarantees Array of Quad in these two cases
    // console.log(qstr)
    const filteredStore = this.store.query(qstr) as Quad[]
    return TE.of(arrayToAsyncIterable(filteredStore))
  }
}
