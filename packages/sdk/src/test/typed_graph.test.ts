import test from 'ava'
import { TypedGraph, DocmapNormalizedFrame } from '..'
import * as DocmapsTypes from '../types'
import { rightAnd } from './utils'
import { OneManifestationQuadstore, FromRootExamplesNew } from './__fixtures__/'
import { Transform, Readable } from 'stream'
import { isRight } from 'fp-ts/lib/Either'
import EventEmitter from 'events'
import * as util from 'util'

const factory = DocmapsTypes.DocmapsFactory
const g = new TypedGraph(factory)

test('Graph Extraction of a Manifestation with known codec', async (t) => {
  const mf_te = await g.pickStreamWithCodec(
    {
      type: 'web-page',
    },
    DocmapsTypes.Manifestation,
    OneManifestationQuadstore(),
  )()

  t.true(
    rightAnd(mf_te, (mf) => {
      t.is(mf.id, 'https://w3id.org/docmaps/examples/manifestation')
      t.is(mf.service?.hostname, 'w3id.org')
      t.is(mf.service?.pathname, '/docmaps/examples/manifestation')
      t.is(mf.service?.hash, '#HOMEPAGE')
      t.is(mf.service?.protocol, 'https:')

      // TODO: note how the `url` key in the jsonld context has a @type key, and therefore
      // ALL values for this must have @type specified as `xsd:anyURI` to be safely
      // parsed by `jsonld.js`. Without type specification in the data, compaction/framing
      // algorithm will use the CURIE instead of the term.
      t.is(mf.url?.toString(), 'https://w3id.org/docmaps/examples/manifestation#URL')
    }),
  )
})

test('Graph extraction by constraint', async (t) => {
  const p_te = await g.pickStreamWithCodec(
    {
      id: 'https://rapidreviewscovid19.mitpress.mit.edu/',
    },
    DocmapsTypes.Publisher,
    FromRootExamplesNew().epmc_01_nt,
  )()

  t.true(
    rightAnd(p_te, (p_any) => {
      const p = p_any as DocmapsTypes.PublisherT

      t.is(p.account?.id, 'https://sciety.org/groups/rapid-reviews-covid-19')
      t.is(p.id, 'https://rapidreviewscovid19.mitpress.mit.edu/')
    }),
  )
})

test('Graph Extraction of a Manifestation', async (t) => {
  const mf_te = await g.pickStream(OneManifestationQuadstore(), {
    type: 'web-page', // selects the Publisher
  })()

  t.true(
    rightAnd(mf_te, (mf_any) => {
      const mf = mf_any as DocmapsTypes.ManifestationT

      t.is(mf.id, 'https://w3id.org/docmaps/examples/manifestation')
      t.is(mf.service?.hostname, 'w3id.org')
      t.is(mf.service?.pathname, '/docmaps/examples/manifestation')
      t.is(mf.service?.hash, '#HOMEPAGE')
      t.is(mf.service?.protocol, 'https:')

      // TODO: note how the `url` key in the jsonld context has a @type key, and therefore
      // ALL values for this must have @type specified as `xsd:anyURI` to be safely
      // parsed by `jsonld.js`. Without type specification in the data, compaction/framing
      // algorithm will use the CURIE instead of the term.
      t.is(mf.url?.toString(), 'https://w3id.org/docmaps/examples/manifestation#URL')
    }),
  )
})

test('Parsing JSONLD from concrete elife examples', async (t) => {
  const examples = FromRootExamplesNew()
  const jld = examples.elife_01_jsonld
  const codec = g.codecFor(jld)

  t.is(codec, DocmapsTypes.Docmap)

  const dm_elife = g.parseJsonldWithCodec(codec, jld) as DocmapsTypes.DocmapT

  t.is(
    dm_elife.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )

  t.deepEqual(dm_elife.updated, new Date('2022-11-28T11:30:05+00:00'))
})

test('Parsing JSONLD from concrete embo examples', async (t) => {
  const examples = FromRootExamplesNew()
  const jld = examples.embo_01_jsonld

  const codec = g.codecFor(jld)

  t.is(codec, DocmapsTypes.Docmap)

  const dm_embo = g.parseJsonldWithCodec(codec, jld) as DocmapsTypes.DocmapT

  t.is(dm_embo.id, 'https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774')
  t.deepEqual(dm_embo.created, new Date('2023-02-13T05:43:49.289Z'))
  t.is(dm_embo.publisher.name, 'review commons')
  t.is(dm_embo.publisher.url?.toString(), 'https://reviewcommons.org/')
  if (!dm_embo.steps) {
    throw 'steps did not parse' // must interrupt flow for type safety later
  }
  t.is(Object.keys(dm_embo.steps).length, 2)
})

test('Graph Extraction of a Docmap', async (t) => {
  const examples = FromRootExamplesNew()
  const dm_elife_te = await g.pickStream(examples.elife_01_nt, DocmapNormalizedFrame)()

  t.true(
    rightAnd(dm_elife_te, (dm_any) => {
      const dm_elife = dm_any as DocmapsTypes.DocmapT

      t.is(
        dm_elife.id,
        'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
      )
      t.deepEqual(dm_elife.publisher, {
        id: 'https://elifesciences.org/',
        homepage: new URL('https://elifesciences.org/'),
        logo: new URL(
          'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
        ),
        name: 'eLife',
        account: {
          id: 'https://sciety.org/groups/elife',
          service: new URL('https://sciety.org'),
        },
      })

      if (!dm_elife.steps) {
        t.fail('no steps found, expected 4')
        return
      }

      t.deepEqual(Object.keys(dm_elife.steps).sort(), ['_:b0', '_:b2', '_:b3'])
    }),
  )
})

test('Graph Extraction of a Docmap with known codec', async (t) => {
  const examples = FromRootExamplesNew()
  const dm_elife_te = await g.pickStreamWithCodec(
    DocmapNormalizedFrame,
    DocmapsTypes.Docmap,
    examples.elife_01_nt,
  )()

  t.true(
    rightAnd(dm_elife_te, (dm_elife) => {
      t.is(
        dm_elife.id,
        'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
      )
      t.deepEqual(dm_elife.publisher, {
        id: 'https://elifesciences.org/',
        homepage: new URL('https://elifesciences.org/'),
        logo: new URL(
          'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
        ),
        name: 'eLife',
        account: {
          id: 'https://sciety.org/groups/elife',
          service: new URL('https://sciety.org'),
        },
      })

      if (!dm_elife.steps) {
        t.fail('no steps found, expected 4')
        return
      }

      t.deepEqual(Object.keys(dm_elife.steps).sort(), ['_:b0', '_:b2', '_:b3'])
    }),
  )
})

test('Graph extraction of additional docmaps', async (t) => {
  const examples = FromRootExamplesNew()

  const dm_embo = await g.pickStream(examples.embo_01_nt, DocmapNormalizedFrame)()

  t.true(
    rightAnd(dm_embo, (dm_any) => {
      const dm = dm_any as DocmapsTypes.DocmapT
      t.is(dm.id, examples.embo_01_jsonld.id)
    }),
  )

  const dm_elife_2 = await g.pickStream(examples.elife_02_nt, DocmapNormalizedFrame)()

  t.true(
    rightAnd(dm_elife_2, (dm_any) => {
      const dm = dm_any as DocmapsTypes.DocmapT
      t.is(dm.id, examples.elife_02_jsonld.id)
    }),
  )
})

test('Graph extraction with only one step', async (t) => {
  const examples = FromRootExamplesNew()

  const dm_epmc = await g.pickStream(examples.epmc_01_nt, DocmapNormalizedFrame)()

  t.true(
    rightAnd(dm_epmc, (dm_any) => {
      const dm = dm_any as DocmapsTypes.DocmapT
      t.is(dm.id, examples.epmc_01_jsonld.id)
    }),
  )
})

test('Graph extraction failure mode when a stream is interrupted', async (t) => {
  const examples = FromRootExamplesNew()
  // this is an eventemitter, not an actual stream
  const wholeStream = examples.elife_01_nt

  let i = 0
  const max = 5

  // a stream that abruptly ends
  const limitedStream = new Transform({
    objectMode: true, // This is necessary if your stream is not a stream of Buffers or strings
    transform(chunk, _enc, callback) {
      if (i < max) {
        this.push(chunk)
        i++
      } else {
        this.push(null) // This ends the stream
      }
      callback()
    },
  })

  const iter = EventEmitter.on(wholeStream, 'data')

  const readable = Readable.from(iter)

  readable.pipe(limitedStream)

  const elife_truncated = await g.pickStream(limitedStream, DocmapNormalizedFrame)()

  if (isRight(elife_truncated)) {
    t.fail('succeeded to parse when should have failed')
    return
  }

  const err = elife_truncated.left
  t.regex(util.inspect(err, { depth: null }), /error received from upstream/)
})

// TODO - perhaps parse the actual values by iterating over all allowed types
//      This test was removed because it assumed that the Type field would be
//      present on the Publisher. This is a future facing consideration for
//      when we hope to parse out typed info from RDF.
//
// test('Graph Extraction of a publisher', async (t) => {
//   const pub = await g.pickStream(OnePublisherQuadstore(), {
//     'type': "foaf:organization", // selects the Publisher
//   }) as DocmapsTypes.PublisherT;
//
//   t.is(pub.id, 'https://w3id.org/docmaps/examples/publisher');
//   t.is(pub.name, 'Example Publisher');
//   t.is(pub.logo, 'https://w3id.org/docmaps/examples/publisher#logo.img');
//   t.is(pub.homepage, 'https://w3id.org/docmaps/examples/publisher#www');
//   t.is(pub.url, 'https://w3id.org/docmaps/examples/publisher#www');
//   t.is(pub.account?.service, 'https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE');
// });
