import test from 'ava';
import rdf from '@rdfjs/data-model';
import { TypedGraph } from './typed_graph';
import { Readable } from 'readable-stream'
import * as DocmapsTypes from './types';

test('Graph Extraction', async (t) => {
  const factory = DocmapsTypes.DocmapsFactory;

  let g = new TypedGraph(
    factory,
  );

  const input = new Readable({
    objectMode: true,
    read: () => {
      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/organization')))
      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/name'),
        rdf.literal('Example Publisher')))
      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/logo'),
        rdf.literal('https://w3id.org/docmaps/examples/publisher#logo.img')))
      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/homepage'),
        rdf.literal('https://w3id.org/docmaps/examples/publisher#www')))

      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/onlineAccount'),
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher_account')))

      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher_account'),
        rdf.namedNode('http://xmlns.com/foaf/0.1/accountServiceHomepage'),
        rdf.literal('https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE')))
      input.push(rdf.quad(
        rdf.namedNode('https://w3id.org/docmaps/examples/docmap'),
        rdf.namedNode('http://purl.org/dc/terms/publisher'),
        rdf.namedNode('https://w3id.org/docmaps/examples/publisher')))
      input.push(null);
    }
  })

  const pub = await g.pickStream(input) as DocmapsTypes.DocmapPublisherT;

  t.is(pub.name, 'Example Publisher');
  t.is(pub.logo, 'https://w3id.org/docmaps/examples/publisher#logo.img');
  t.is(pub.homepage, 'https://w3id.org/docmaps/examples/publisher#www');
  t.is(pub.account?.service, 'https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE');
});
