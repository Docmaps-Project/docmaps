import type { CrossrefClient } from 'crossref-openapi-client-ts'
import type { DocmapPublisherT } from 'docmaps-sdk'
import { right } from 'fp-ts/lib/Either'

import * as crossref from './plugins/crossref'

import type { ErrorOrDocmap } from './types'

// TODO rewrite this to assume it generates a stream of output rather than a single string
// .. although actually, the streaming may be a layer down instead
export type Cmd<ArgT extends string[], OptT> = (args: ArgT, opts: OptT) => Promise<ErrorOrDocmap>

export interface CrossrefConfiguration {
  preset: 'crossref-api'
  client: CrossrefClient
}

/**
 * ItemOpts
 *
 * Configuration for a single Item invocation.
 */
export interface ItemOpts {
  source: CrossrefConfiguration
  publisher: DocmapPublisherT
}

/**
 * ItemCmd
 *
 * Generates a Docmap for a single DOI. Behavior
 * may depend on the source configuration provided.
 */
export const ItemCmd: Cmd<[string], ItemOpts> = ([doi], opts) => {
  return crossref.fetchPublicationByDoi(opts.source.client, opts.publisher, doi)
}

/**
 * PageCmd
 *
 * Needs implementation!
 */
export interface PageOpts {
  source: CrossrefConfiguration
  prefix: string
  rowsPerPage?: number
  pageNumber?: number
}

export const PageCmd: Cmd<[], PageOpts> = async (_a, _opts) => {
  return right([])
}
