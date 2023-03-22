import test from 'ava';
import { TypedGraph, DocmapNormalizedFrame } from './typed_graph';
import * as DocmapsTypes from './types';
import {
  OneManifestationQuadstore,
  OnePublisherQuadstore,
  FromRootExamples,
} from './__fixtures__/';

const factory = DocmapsTypes.DocmapsFactory;
const g = new TypedGraph(
  factory,
);

test('Graph Extraction of a publisher', async (t) => {
  const pub = await g.pickStream(OnePublisherQuadstore(), {
    'type': "foaf:organization", // selects the Publisher
  }) as DocmapsTypes.DocmapPublisherT;

  t.is(pub.id, 'https://w3id.org/docmaps/examples/publisher');
  t.is(pub.name, 'Example Publisher');
  t.is(pub.logo, 'https://w3id.org/docmaps/examples/publisher#logo.img');
  t.is(pub.homepage, 'https://w3id.org/docmaps/examples/publisher#www');
  t.is(pub.url, 'https://w3id.org/docmaps/examples/publisher#www');
  t.is(pub.account?.service, 'https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE');
});

test('Graph Extraction of a Manifestation', async (t) => {
  const mf = await g.pickStream(OneManifestationQuadstore(), {
    'type': "web-page", // selects the Publisher
  }) as DocmapsTypes.DocmapManifestationT;

  t.is(mf.id, 'https://w3id.org/docmaps/examples/manifestation');
  t.is(mf.service, 'https://w3id.org/docmaps/examples/manifestation#HOMEPAGE');

  // TODO: note how the `url` key in the jsonld context has a @type key, and therefore
  // ALL values for this must have @type specified as `xsd:anyURI` to be safely
  // parsed by `jsonld.js`. Without type specification in the data, compaction/framing
  // algorithm will use the CURIE instead of the term.
  t.is(mf.url, 'https://w3id.org/docmaps/examples/manifestation#URL');
});

test('Parsing JSONLD from concrete examples', async (t) => {
  const dm_elife = g.parseJsonld(FromRootExamples.elife_01_jsonld) as DocmapsTypes.DocmapT;

  t.is(dm_elife.id, 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698');
});

