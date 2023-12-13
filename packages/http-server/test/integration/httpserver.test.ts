import test from 'ava'
import * as D from '@docmaps/sdk'
import { inspect } from 'util'
import { API_VERSION } from '../../src'
import { MakeHttpClient } from '@docmaps/http-client'
import { withNewServer } from './utils'

import { ErrorBody } from '@docmaps/http-client'

//FIXME: the close step is by far the longest in server setup, so
//  these should not shut down express server between tests.
test.serial('it serves info endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })

    const info = await client.getInfo()

    t.is(info.status, 200)
    t.is(info.headers.get('Access-Control-Allow-Origin'), '*')
    t.deepEqual(info.body, {
      // FIXME: this is technically a lie, because it is not prefixed /docmaps/v1
      api_url: 'http://localhost:33033/docmaps/v1/',
      api_version: API_VERSION,
      ephemeral_document_expiry: {
        max_retrievals: 1,
        max_seconds: 60,
      },
      peers: [],
    })
  }, t.log)
})

test.serial('it serves /docmap endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })
    const testIri =
      'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698'

    const resp = await client.getDocmapById({
      params: { id: encodeURI(encodeURIComponent(testIri)) },
    })

    t.is(resp.status, 200, `failed with this response: ${inspect(resp, { depth: null })}`)

    const dm = resp.body as D.DocmapT

    t.deepEqual(dm.id, testIri)
    t.deepEqual(dm.publisher, {
      account: {
        id: 'https://sciety.org/groups/elife',
        service: 'https://sciety.org/',
      },
      homepage: 'https://elifesciences.org/',
      id: 'https://elifesciences.org/',
      logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
      name: 'eLife',
    })
  }, t.log)
})

test.serial('it serves /docmap_for/doi endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })
    const testDoi1 = '10.1101/2021.03.24.436774'

    const resp = await client.getDocmapForDoi({
      query: { subject: testDoi1 },
    })

    t.is(resp.status, 200, `failed with this response: ${inspect(resp, { depth: null })}`)

    const dm = resp.body as D.DocmapT

    t.deepEqual(dm.id, 'https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774')
    t.deepEqual(dm.publisher, {
      name: 'review commons',
      url: 'https://reviewcommons.org/',
    })

    // test handling case where multiples exist
    const testDoi2 = '10.1101/2022.11.08.515698'

    const resp2 = await client.getDocmapForDoi({
      query: { subject: testDoi2 },
    })

    t.is(resp2.status, 200, `failed with this response: ${inspect(resp, { depth: null })}`)

    const dm2 = resp2.body as D.DocmapT

    t.deepEqual(
      dm2.id,
      'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
    )
    t.deepEqual(dm2.publisher, {
      account: {
        id: 'https://sciety.org/groups/elife',
        service: 'https://sciety.org/',
      },
      homepage: 'https://elifesciences.org/',
      id: 'https://elifesciences.org/',
      logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
      name: 'eLife',
    })
  }, t.log)
})

test.serial('it errors with helpful body in /docmap_for/doi endpoint', async (t) => {
  await withNewServer(async (_s) => {
    const client = MakeHttpClient({
      baseUrl: 'http://localhost:33033',
      baseHeaders: {},
    })
    const testDoi1 = '10.1101/notPresent'

    const resp = await client.getDocmapForDoi({
      query: { subject: testDoi1 },
    })

    t.is(
      resp.status,
      404,
      `expected 404 but got ${resp.status} response: ${inspect(resp, { depth: null })}`,
    )

    const error = resp.body as ErrorBody

    t.deepEqual(error, { message: 'zero quads found for query' })
  }, t.log)
})
