import * as D from '@docmaps/sdk'
import * as TE from 'fp-ts/TaskEither'

// TODO: use io-ts? this is only decodable by consumers...
export type ApiInfo = {
  api_url: string
  api_version: string
  ephemeral_document_expiry: {
    max_seconds: number
    max_retrievals: number
  }
  peers: {
    api_url: string
  }[]
}

export type ThingSpec = {
  identifier: string
  kind: 'iri' | 'doi'
}

// TODO is this the same as the Client?
export interface BackendAdapter {
  docmapWithIri(iri: string): TE.TaskEither<Error, D.DocmapT>
  docmapForThing(thing: ThingSpec): TE.TaskEither<Error, D.DocmapT>
}
