import type { CrossrefClient, WorksService } from 'crossref-openapi-client-ts';
import * as crossref  from './crossref'

// TODO rewrite this to assume it generates a stream of output rather than a single string
// .. although actually, the streaming may be a layer down instead
export type Cmd<ArgT extends string[], OptT> = (args: ArgT, opts: OptT) => Promise<string>

// helpcmd is the one type that does not need defining
// export const HelpCmd: Cmd<{}> = (s, opts) => {
//   console.log(s =
// };

// export interface StreamOpts {
//   source: 'crossref-api'
// }

export interface PageOpts {
  source: 'crossref-api',
  // service: WorksService,
  client: CrossrefClient,
  prefix: string,
  rowsPerPage?: number,
  pageNumber?: number,
}

export const PageCmd: Cmd<[], PageOpts> = async (_a, opts) => {
  const pubData = await crossref.fetchPublications(opts.client, opts.prefix, opts.rowsPerPage, opts.pageNumber )
  return JSON.stringify(pubData)
};

