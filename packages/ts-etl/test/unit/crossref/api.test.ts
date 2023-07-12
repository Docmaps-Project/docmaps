import test from 'ava'
import { isLeft, isRight } from 'fp-ts/lib/Either'
import { whenThenResolve } from '../utils'
import type { CrossrefClient } from 'crossref-openapi-client-ts'
import { CrossrefPlugin } from '../../../src/plugins/crossref'
import { stepsForIdRecursive } from '../../../src/processor'
import * as cm from '../__fixtures__/crossref'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

function makeRoutine(c: CrossrefClient) {
  const plugin = CrossrefPlugin(c)
  return (doi: string) => {
    return pipe(
      stepsForIdRecursive(plugin, doi, new Set<string>(), { inputs: [] }),
      TE.map((c) => c.all),
    )
  }
}

test('fetchPublicationByDoi: happy-path scenario: a manuscript with one preprint and no reviews', async (t) => {
  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.MANUSCRIPT_DOI },
    cm.mockCrossrefManuscriptWithPreprintResponse,
  )
  whenThenResolve(mocks.worksT.getWorks, { doi: cm.PREPRINT_DOI }, cm.mockCrossrefPreprintResponse)
  const routine = makeRoutine(mocks.crs)

  const res = await routine(cm.MANUSCRIPT_DOI)()

  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  const steps = res.right
  t.is(steps.length, 2)

  t.is(steps[0]?.inputs?.length, 0)
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(steps[1]?.inputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.doi, cm.MANUSCRIPT_DOI)
  //TODO: can write stronger assertions as we learn what this should look like
})

test('fetchPublicationByDoi: happy-path scenario: a manuscript discovered from its preprint', async (t) => {
  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.MANUSCRIPT_DOI },
    cm.mockCrossrefManuscriptWithPreprintResponse,
  )
  whenThenResolve(mocks.worksT.getWorks, { doi: cm.PREPRINT_DOI }, cm.mockCrossrefPreprintResponse)
  const routine = makeRoutine(mocks.crs)

  const res = await routine(cm.PREPRINT_DOI)()

  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  t.is(res.right.length, 2)
  const steps = res.right

  t.is(steps[0]?.inputs.length, 0)
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(steps[1]?.inputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.doi, cm.MANUSCRIPT_DOI)
  //TODO: can write stronger assertions as we learn what this should look like
})

test('fetchPublicationByDoi: happy-path scenario: a manuscript with no relations', async (t) => {
  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.MANUSCRIPT_DOI },
    cm.mockCrossrefManuscriptResponse,
  )
  const routine = makeRoutine(mocks.crs)

  const res = await routine(cm.MANUSCRIPT_DOI)()

  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  t.is(res.right.length, 1)
  const steps = res.right
  t.deepEqual(steps[0]?.inputs.length, 0)
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.doi, cm.MANUSCRIPT_DOI)
})

test('fetchPublicationByDoi: happy-path scenario: a manuscript with 2 reviews and no preprint', async (t) => {
  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.MANUSCRIPT_DOI },
    cm.mockCrossrefManuscriptWithReviewsResponse,
  )
  // TODO - this implies each Review is fetched on its own
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.REVIEW_1_DOI },
    cm.mockCrossrefReviewsResponses[0],
  )
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.REVIEW_2_DOI },
    cm.mockCrossrefReviewsResponses[1],
  )
  const routine = makeRoutine(mocks.crs)

  const res = await routine(cm.MANUSCRIPT_DOI)()

  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  const steps = res.right
  t.is(steps.length, 2)

  t.deepEqual(steps[0]?.inputs.length, 0)
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.doi, cm.MANUSCRIPT_DOI)
  t.deepEqual(steps[1]?.inputs[0]?.doi, cm.MANUSCRIPT_DOI)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.doi, cm.REVIEW_1_DOI)
  t.deepEqual(steps[1]?.actions[1]?.outputs[0]?.doi, cm.REVIEW_2_DOI)
})

test('fetchPublicationByDoi: error case: looking up a crossref work of wrong type', async (t) => {
  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(
    mocks.worksT.getWorks,
    { doi: cm.REVIEW_1_DOI },
    cm.mockCrossrefReviewsResponses[0],
  )
  const routine = makeRoutine(mocks.crs)

  const res = await routine(cm.REVIEW_1_DOI)()

  if (isRight(res)) {
    t.fail(`Got docmaps instead of error: ${res.right}`)
    return
  }

  t.regex(res.left.message, /requested root docmap for crossref entity of type 'peer-review'/)
})
