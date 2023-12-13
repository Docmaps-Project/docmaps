import { Readable } from 'readable-stream'
import rdf from '@rdfjs/data-model'

const urlType = rdf.namedNode('http://www.w3.org/2001/XMLSchema#anyURI')

export const OnePublisherQuadstore = () => {
  const r = new Readable({
    objectMode: true,
    read: () => {
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/organization'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/name'),
          rdf.literal('Example Publisher'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/logo'),
          rdf.literal('https://w3id.org/docmaps/examples/publisher#logo.img'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/homepage'),
          rdf.literal('https://w3id.org/docmaps/examples/publisher#www'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://purl.org/spar/fabio/hasURL'),
          // TODO because of the jsonld compaction algorithm, and that the hasURL key in our
          // context has a datatype associated, this literal value MUST have a datatype
          // included in its object in order to be correctly parsed into a Term from the
          // context, rather than into a CURIE calculated on the fly.
          rdf.literal('https://w3id.org/docmaps/examples/publisher#www', urlType),
        ),
      )

      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/onlineAccount'),
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher_account'),
        ),
      )

      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher_account'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/accountServiceHomepage'),
          rdf.literal('https://w3id.org/docmaps/examples/publisher_account#HOMEPAGE'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/docmap'),
          rdf.namedNode('http://purl.org/dc/terms/publisher'),
          rdf.namedNode('https://w3id.org/docmaps/examples/publisher'),
        ),
      )
      r.push(null)
    },
  })

  return r
}

export const OneManifestationQuadstore = () => {
  const r = new Readable({
    objectMode: true,
    read: () => {
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/manifestation'),
          rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          rdf.namedNode('http://purl.org/spar/fabio/WebPage'),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/manifestation'),
          rdf.namedNode('http://purl.org/spar/fabio/hasURL'),
          rdf.literal('https://w3id.org/docmaps/examples/manifestation#URL', urlType),
        ),
      )
      r.push(
        rdf.quad(
          rdf.namedNode('https://w3id.org/docmaps/examples/manifestation'),
          rdf.namedNode('http://xmlns.com/foaf/0.1/accountServiceHomepage'),
          rdf.literal('https://w3id.org/docmaps/examples/manifestation#HOMEPAGE'),
        ),
      )
      r.push(null)
    },
  })
  return r
}
