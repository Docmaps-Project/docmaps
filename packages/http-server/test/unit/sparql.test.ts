import test from 'ava'
import { SparqlAdapter } from '../../src/adapter'
import * as E from 'fp-ts/lib/Either'
import { inspect } from 'util'
import * as fixtures from '../__fixtures__/docmaps'

test('docmapForThing: extracts a realistic docmap from a sparql backend when the steps already exist', async (t) => {
  const backend = fixtures.CreateDatastore()

  const processor = new SparqlAdapter(backend)

  const docmap = await processor.docmapForThing({
    identifier: '10.1101/2022.11.08.515698',
    kind: 'doi',
  })()

  if (E.isLeft(docmap)) {
    t.fail(`got error instead of docmap: ${inspect(docmap.left, { depth: 4 })}`)
    return
  }

  t.is(
    docmap.right.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )

  const steps = docmap.right.steps
  if (!steps) {
    t.fail('expected to find steps, but was null')
    return
  }

  t.is(Object.keys(steps).length, 3)
})

test('docmapForThing: extracts a realistic docmap from a sparql backend when there are multiple candidates', async (t) => {
  const backend = fixtures.CreateDatastore()

  const processor = new SparqlAdapter(backend)

  const docmap = await processor.docmapForThing({
    identifier: '10.1101/2022.11.08.515698',
    kind: 'doi',
  })()

  if (E.isLeft(docmap)) {
    t.fail(`got error instead of docmap: ${inspect(docmap.left, { depth: 4 })}`)
    return
  }

  t.is(
    docmap.right.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )

  const steps = docmap.right.steps
  if (!steps) {
    t.fail('expected to find steps, but was null')
    return
  }

  t.is(Object.keys(steps).length, 3)
})

test('docmapForThing: returns a failure case if no docmap can be found for a doi', async (t) => {
  const backend = fixtures.CreateDatastore()

  const processor = new SparqlAdapter(backend)

  const docmap = await processor.docmapForThing({
    identifier: '10.1101/2022.11.08.nonexistent',
    kind: 'doi',
  })()

  if (E.isRight(docmap)) {
    t.fail(`got docmap instead of error: ${inspect(docmap.right, { depth: 4 })}`)
    return
  }

  t.regex(docmap.left.message, /not found/)
})

test('docmapWithiri: constructs and extracts a realistic docmap from a sparql backend', async (t) => {
  const backend = fixtures.CreateDatastore()

  const processor = new SparqlAdapter(backend)

  const docmap = await processor.docmapWithIri(
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )()

  if (E.isLeft(docmap)) {
    t.fail(`got error instead of docmap: ${inspect(docmap.left, { depth: 4 })}`)
    return
  }

  t.is(
    docmap.right.id,
    'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  )

  const steps = docmap.right.steps
  if (!steps) {
    t.fail('expected to find steps, but was null')
    return
  }

  t.is(Object.keys(steps).length, 3)
})

/* This test is removed because although it passes, it
 * causes the suite to timeout mysteriously:
 * https://github.com/avajs/ava/discussions/3248
 *
 * test.serial('query performance in simple scenario: < 10ms each', async (t) => {
 *   t.timeout(20000)
 *   const backend = fixtures.CreateDatastore()

 *   const processor = new SparqlAdapter(backend)

 *   const start = new Date()

 *   for (let i = 0; i < 1000; i++) {
 *     await processor.docmapWithIri(
 *       'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
 *     )()
 *   }

 *   const end = new Date()
 *   t.true(end.getTime() - start.getTime() < 10000)
 * })
 */
