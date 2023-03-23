import test from 'ava'
import { TypedGraph } from '..'
import * as DocmapsTypes from '../types'
import { OneManifestationQuadstore, FromRootExamples } from './__fixtures__/'

const factory = DocmapsTypes.DocmapsFactory
const g = new TypedGraph(factory)

test('Graph Extraction of a Manifestation', async (t) => {
  const mf = (await g.pickStream(OneManifestationQuadstore(), {
    type: 'web-page', // selects the Publisher
  })) as DocmapsTypes.DocmapManifestationT

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
})

test('Parsing JSONLD from concrete elife examples', async (t) => {
  const dm_elife = g.parseJsonld(FromRootExamples.elife_01_jsonld) as DocmapsTypes.DocmapT

  t.is(
    dm_elife.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )
})

test('Parsing JSONLD from concrete embo examples', async (t) => {
  const dm_embo = g.parseJsonld(FromRootExamples.embo_01_jsonld) as DocmapsTypes.DocmapT

  t.is(dm_embo.id, 'https://eeb.embo.org/api/v2/docmap/10.1101/2021.03.24.436774')
  t.is(dm_embo.publisher.name, 'review commons')
  t.is(dm_embo.publisher.url?.toString(), 'https://reviewcommons.org/')
  if (!dm_embo.steps) {
    throw 'steps did not parse' // must interrupt flow for type safety later
  }
  t.is(Object.keys(dm_embo.steps).length, 2)
})

// test('Graph Extraction of a Docmap', async (t) => {
//   const dm_elife = await g.pickStream(FromRootExamples.elife_01_nt,
//     DocmapNormalizedFrame ) as DocmapsTypes.DocmapT;
//
//   t.is(dm_elife.id, 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698');
// });

// TODO - perhaps parse the actual values by iterating over all allowed types
//      This test was removed because it assumed that the Type field would be
//      present on the Publisher. This is a future facing consideration for
//      when we hope to parse out typed info from RDF.
//
// test('Graph Extraction of a publisher', async (t) => {
//   const pub = await g.pickStream(OnePublisherQuadstore(), {
//     'type': "foaf:organization", // selects the Publisher
//   }) as DocmapsTypes.DocmapPublisherT;
//
//   t.is(pub.id, 'https://w3id.org/docmaps/examples/publisher');
//   t.is(pub.name, 'Example Publisher');
//   t.is(pub.logo, 'https://w3id.org/docmaps/examples/publisher#logo.img');
//   t.is(pub.homepage, 'https://w3id.org/docmaps/examples/publisher#www');
//   t.is(pub.url, 'https://w3id.org/docmaps/examples/publisher#www');
//   t.is(pub.account?.service, 'https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE');
// });
