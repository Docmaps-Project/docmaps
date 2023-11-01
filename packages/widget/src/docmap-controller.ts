import { MakeHttpClient } from '@docmaps/http-client'
import * as D from 'docmaps-sdk'

export const getDocmap = async ([serverUrl, doi]: [string, string]) => {
  const client = MakeHttpClient({
    baseUrl: serverUrl,
    baseHeaders: {},
  })

  const resp = await client.getDocmapForDoi({
    query: { subject: doi },
  })

  if (resp.status !== 200) {
    throw new Error('Failed to FETCH docmap')
  }

  return (resp.body as D.DocmapT).id
}