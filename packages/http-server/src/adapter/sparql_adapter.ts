import type * as RDF from '@rdfjs/types'
import { CONSTRUCT, Construct, Describe } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as D from 'docmaps-sdk'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import n3 from 'n3'
import { collect } from 'streaming-iterables'
import { pipe } from 'fp-ts/lib/function'
import factory from '@rdfjs/data-model'
import { BackendAdapter, ThingSpec } from '../types'
import { Logger } from 'pino'
import util from 'util'
import { Separated } from 'fp-ts/lib/Separated'

/** Inteface for an in-memory or over-the-web mechanism that accepts
 * SPARQL queries and returns triples.
 * @since 0.1.0
 */
export interface SparqlProcessor {
  // truthy(query: string): Promise<boolean>
  triples(query: Construct | Describe): TE.TaskEither<Error, AsyncIterable<RDF.Quad>>
  // bindings(query: string): Promise<AsyncIterable<{ [key: string]: RDF.Term }>>
}

function FindDocmapQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ map: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
    ?map ?p0 ?o0 .
  `.WHERE`
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
    UNION
    {
      SELECT DISTINCT ?map ?p0 ?o0 WHERE {
        ${VALUES(...values)}
        ?map ?p0 ?o0 .
      }
    }
  `

  return q
}

function DocmapForThingIriQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ thing: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?map ?s ?p WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?thing .
      }
    }
    UNION
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}

function DocmapForThingDoiQuery(doi: string): Construct {
  const doiLit = factory.literal(doi)
  const values = [{ doi: doiLit }]

  // FIXME: use UNION to minimize the quads retrieved
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?s0 <http://prismstandard.org/namespaces/basic/2.0/doi> ?doi .
        ?map (!<>)+ ?s0 .
        ?map <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/pwo/Workflow> .
        ?map (!<>)* ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}

function docmapIrisFromStore(store: n3.Store): Array<string> {
  const dmTypeQs = store.getSubjects(
    factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    factory.namedNode('http://purl.org/spar/pwo/Workflow'),
    null,
  )

  return dmTypeQs.map((s) => s.value)
}

// TODO: consider writing this as functional on sub-subgraphs. Performance motivations.
// Currently in cases of lists, we process all the docmaps then filter
const docmapMatching: (s: n3.Store) => (iri: string) => TE.TaskEither<Error, D.DocmapT> =
  (
    store: n3.Store,
    // maxDepth: number = -1,
  ) =>
  (iri: string) => {
    return new D.TypedGraph().pickStreamWithCodec(
      { ...D.DocmapNormalizedFrame, id: iri },
      D.Docmap,
      store.match(),
    )
  }

export class SparqlAdapter implements BackendAdapter {
  q: SparqlProcessor
  logger: Logger

  constructor(q: SparqlProcessor, logger: Logger) {
    this.q = q
    this.logger = logger.child({ backend: 'sparql-adapter' })
  }

  docmapWithIri(iri: string): TE.TaskEither<Error, D.DocmapT> {
    const query = FindDocmapQuery(iri)

    const g = new D.TypedGraph()

    const program = pipe(
      this.q.triples(query),
      TE.chain((iter) =>
        TE.tryCatch(
          () => collect(iter),
          (reason) => new Error(`failed to create quads from iterator: ${reason}`),
        ),
      ),
      TE.chainEitherK((quads) => {
        return quads.length > 0
          ? E.right(quads)
          : E.left(new Error('content not found for queried DOI'))
      }),
      TE.map((quads: Array<RDF.Quad>) => {
        return new n3.Store(quads).match()
      }),
      TE.chain((stream: RDF.Stream) =>
        g.pickStreamWithCodec(D.DocmapNormalizedFrame, D.Docmap, stream),
      ),
    )

    return program
  }

  docmapForThing(thing: ThingSpec): TE.TaskEither<Error, D.DocmapT> {
    let query: Construct
    switch (thing.kind) {
      case 'iri':
        query = DocmapForThingIriQuery(thing.identifier)
        // FIXME: this case is not known and requires test implementation.
        throw 'not implemented'
      case 'doi':
        query = DocmapForThingDoiQuery(thing.identifier)
    }

    const program = pipe(
      this.q.triples(query),
      TE.chain((iter) =>
        TE.tryCatch(
          () => collect(iter),
          (reason) => new Error(`failed to create quads from iterator: ${reason}`),
        ),
      ),
      TE.chainEitherK((quads) => {
        this.logger.trace(
          `got quads for query:\n${quads.map(
            (q) => `${q.subject.value} ${q.predicate.value} ${q.object.value} .\n`,
          )}`,
        )
        return quads.length > 0 ? E.right(quads) : E.left(new Error('zero quads found for query'))
      }),
      TE.chain((quads: Array<RDF.Quad>) => {
        const store = new n3.Store(quads)
        return pipe(
          store,
          docmapIrisFromStore,
          A.map(docmapMatching(store)),
          A.sequence(T.ApplicativePar),
          // make a Separated<> to group the Lefts apart from the Rights
          T.map<E.Either<Error, D.DocmapT>[], Separated<Error[], D.DocmapT[]>>(A.separate),
          T.map((separated: Separated<Error[], D.DocmapT[]>) => {
            this.logger.debug(
              `framing yielded ${separated.right.length} docmaps and ${separated.left.length} errors`,
            )
            const first = separated.right[0]
            if (!first) {
              return E.left(
                new Error(`no success cases: ${util.inspect(separated.left, { depth: 6 })}`),
              )
            }

            return E.right(separated.right.reduce((m, a) => (a.created > m.created ? a : m), first))
          }),
        )
      }),
    )

    return program
  }
}
