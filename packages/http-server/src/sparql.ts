import { CONSTRUCT, Construct } from '@tpluscode/sparql-builder'
import factory from '@rdfjs/data-model'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import { SELECT } from '@tpluscode/sparql-builder'

export const COUNT_TOTAL_TRIPLES_QUERY = SELECT`(count(*) as ?n)`.WHERE`?s ?p ?o .`

export function FindDocmapQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ map: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
    ?map ?p0 ?o0 .
  `.WHERE`
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
    UNION
    {
      SELECT DISTINCT ?map ?p0 ?o0 WHERE {
        ${VALUES(...values)}
        ?map ?p0 ?o0 .
      }
    }
  `

  return q
}

export function DocmapForThingIriQuery(iri: string): Construct {
  const subj = factory.namedNode(iri)

  const values = [{ thing: subj }]

  // FIXME: use sparql builder more idiomatically
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?map ?s ?p WHERE {
        ${VALUES(...values)}
        ?map (!<>)+ ?s .
        ?s ?p ?thing .
      }
    }
    UNION
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ?map (!<>)+ ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}

export function DocmapForThingDoiQuery(doi: string): Construct {
  const doiLit = factory.literal(doi)
  const values = [{ doi: doiLit }]

  // FIXME: use UNION to minimize the quads retrieved
  const q = CONSTRUCT`
    ?s ?p ?o .
  `.WHERE`
    {
      SELECT DISTINCT ?s ?p ?o WHERE {
        ${VALUES(...values)}
        ?s0 <http://prismstandard.org/namespaces/basic/2.0/doi> ?doi .
        ?map (!<>)+ ?s0 .
        ?map <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/spar/pwo/Workflow> .
        ?map (!<>)* ?s .
        ?s ?p ?o .
      }
    }
  `

  return q
}
