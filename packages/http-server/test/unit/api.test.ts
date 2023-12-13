import test from 'ava'
import { SparqlAdapter } from '../../src/adapter'
import { ApiInstance } from '../../src/api'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from '@docmaps/sdk'

import { deepEqual, mock, instance, when } from 'ts-mockito'
import { ThingSpec } from '../../src/types'

// TODO: export this in shared module
export function whenThenRight<T, E, V>(
  functor: (input1: T) => TE.TaskEither<E, V>,
  filter: T,
  response: V,
) {
  when(functor(deepEqual(filter))).thenReturn(TE.of(response))
}

const TEST_DATE = new Date()

test('info: default values', (t) => {
  const _adapter = instance(mock(SparqlAdapter))
  const res = new ApiInstance(_adapter, new URL('https://example.com')).get_info()

  t.is(res.api_url, 'https://example.com/')
  t.deepEqual(res.ephemeral_document_expiry, {
    max_seconds: 60,
    max_retrievals: 1,
  })
  t.deepEqual(res.peers, [])
})

test('info: configured values', (t) => {
  const _adapter = instance(mock(SparqlAdapter))
  const res = new ApiInstance(
    _adapter,
    new URL('https://example.com'),
    [new URL('https://other.com')],
    30,
    10,
  ).get_info()

  t.is(res.api_url, 'https://example.com/')
  t.deepEqual(res.ephemeral_document_expiry, {
    max_seconds: 30,
    max_retrievals: 10,
  })
  t.deepEqual(res.peers, [{ api_url: 'https://other.com/' }])
})

test('docmap_by_id: consults the adapter', async (t) => {
  const adapterC = mock(SparqlAdapter)

  const dm_content: D.DocmapT = {
    '@context': 'https://w3id.org/docmaps/context.jsonld',
    type: 'docmap',
    id: 'http://ex/test-docmap',
    publisher: {},
    created: TEST_DATE,
  }

  whenThenRight(adapterC.docmapWithIri, dm_content.id, dm_content)

  const adapter = instance(adapterC)

  const res = await new ApiInstance(
    adapter,
    new URL('https://example.com'),
    [new URL('https://other.com')],
    30,
    10,
  ).get_docmap_by_id(dm_content.id)()

  // TODO awkward use of `await .. ()`, is there a more natural way?
  // The alternative is all that `rightAnd` business in @docmaps/sdk
  t.deepEqual(res, await TE.of(dm_content)())
})

test('docmap_for: consults the adapter', async (t) => {
  const adapterC = mock(SparqlAdapter)

  const dm_content: D.DocmapT = {
    '@context': 'https://w3id.org/docmaps/context.jsonld',
    type: 'docmap',
    id: 'http://ex/test-docmap',
    publisher: {},
    created: TEST_DATE,
  }

  const spec: ThingSpec = { identifier: '10.0000/test-thing', kind: 'doi' }
  whenThenRight(adapterC.docmapForThing, spec, dm_content)

  const adapter = instance(adapterC)

  const res = await new ApiInstance(
    adapter,
    new URL('https://example.com'),
    [new URL('https://other.com')],
    30,
    10,
  ).get_docmap_for_thing(spec)()

  // TODO awkward use of `await .. ()`, is there a more natural way?
  // The alternative is all that `rightAnd` business in @docmaps/sdk
  t.deepEqual(res, await TE.of(dm_content)())
})
