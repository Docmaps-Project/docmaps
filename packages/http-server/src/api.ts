import type { ApiInfo, BackendAdapter, ThingSpec } from './types'
import * as TE from 'fp-ts/TaskEither'
import * as D from 'docmaps-sdk'

/** ApiInstance - a concrete class that handles sourcing data and composing answers
 *
 * This class exists to decouple the notion of an "API" and its data source
 * from the networking layer that is most often going to sit in front of it
 * and make it available.
 *
 * You can use this class to connect to any concrete backend and get a spec-
 * compliant API instance.
 */
export class ApiInstance {
  adapter: BackendAdapter
  api_url: URL
  peers: URL[]
  expiry_max_seconds: number
  expiry_max_retrievals: number

  /**
   * @param api_url is required for info method even if you are not serving over http.
   */
  constructor(
    adapter: BackendAdapter,
    api_url: URL,
    peers: URL[] = [],
    expiry_max_seconds: number = 60,
    expiry_max_retrievals: number = 1,
  ) {
    this.adapter = adapter
    this.api_url = api_url
    this.peers = peers
    this.expiry_max_seconds = expiry_max_seconds
    this.expiry_max_retrievals = expiry_max_retrievals
  }

  get_info(): ApiInfo {
    return {
      api_version: '0.1.0',
      api_url: this.api_url.toString(),
      ephemeral_document_expiry: {
        max_seconds: this.expiry_max_seconds,
        max_retrievals: this.expiry_max_retrievals,
      },
      peers: this.peers.map((p) => ({ api_url: p.toString() })),
    }
  }

  // FIXME: it is likely that this needs to be called docmap_by_iri instead.
  // Current rationale for this name is that the IRI-based docmap "may not"
  // be implicit in any user of this contract, but that is pretty weak.
  get_docmap_by_id(id: string): TE.TaskEither<Error, D.DocmapT> {
    return this.adapter.docmapWithIri(id)
  }

  get_docmap_for_thing(s: ThingSpec): TE.TaskEither<Error, D.DocmapT> {
    return this.adapter.docmapForThing(s)
  }
}
