import type { CrossrefClient } from 'crossref-openapi-client-ts'
import type { DocmapPublisherT } from 'docmaps-sdk'
import { right } from 'fp-ts/lib/Either'

import * as crossref from './plugins/crossref'

import type { ErrorOrDocmap } from './types'

// TODO rewrite this to assume it generates a stream of output rather than a single string
// .. although actually, the streaming may be a layer down instead
export type Cmd<ArgT extends string[], OptT> = (args: ArgT, opts: OptT) => Promise<ErrorOrDocmap>

// helpcmd is the one type that does not need defining
// export const HelpCmd: Cmd<{}> = (s, opts) => {
//   console.log(s =
// };

// export interface StreamOpts {
//   source: 'crossref-api'
// }

export interface CrossrefConfiguration {
  preset: 'crossref-api'
  client: CrossrefClient
}

export interface ItemOpts {
  source: CrossrefConfiguration
  publisher: DocmapPublisherT
}

export interface PageOpts {
  source: CrossrefConfiguration
  prefix: string
  rowsPerPage?: number
  pageNumber?: number
}

export const ItemCmd: Cmd<[string], ItemOpts> = ([doi], opts) => {
  return crossref.fetchPublicationByDoi(opts.source.client, opts.publisher, doi)
}

export const PageCmd: Cmd<[], PageOpts> = async (_a, _opts) => {
  return right([])
}
