import { SELECT } from '@tpluscode/sparql-builder'

export const COUNT_TOTAL_TRIPLES_QUERY = SELECT`(count(*) as ?n)`.WHERE`?s ?p ?o .`
