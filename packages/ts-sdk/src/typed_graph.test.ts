import test from 'ava';
import { TypedGraph } from './typed_graph';
import * as DocmapsTypes from './types';
import { OneManifestationQuadstore, OnePublisherQuadstore } from './__fixtures__/small_quadstore';

test('Graph Extraction of a publisher', async (t) => {
  const factory = DocmapsTypes.DocmapsFactory;

  let g = new TypedGraph(
    factory,
  );

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
  const factory = DocmapsTypes.DocmapsFactory;

  let g = new TypedGraph(
    factory,
  );


  const mf = await g.pickStream(OneManifestationQuadstore(), {
    'type': "web-page", // selects the Publisher
  }) as DocmapsTypes.DocmapManifestationT;

  t.is(mf.id, 'https://w3id.org/docmaps/examples/manifestation');
  t.is(mf.service, 'https://w3id.org/docmaps/examples/manifestation#HOMEPAGE');

  // TODO: note how the `url` key in the jsonld context has a @type key, and therefore
  // ALL values must have @type specified as `xsd:anyURI` for this to be safely
  // parsed by `jsonld.js`. Without type specification in the data, compaction/framing
  // algorithm will use the CURIE instead of the term.
  t.is(mf.url, 'https://w3id.org/docmaps/examples/manifestation#URL');
});
