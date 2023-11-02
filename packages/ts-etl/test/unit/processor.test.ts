import test from 'ava'
import { inspect } from 'util'
import { isRight, isLeft } from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { stepsForIdRecursive } from '../../src/processor'
import { whenThenRight } from './utils'
import * as am from './__fixtures__/abstract'
import type * as D from 'docmaps-sdk'
import { when } from 'ts-mockito'

const nothing = [] as D.ThingT[]

test('happy-path scenario: a manuscript with one preprint and no reviews', async (t) => {
  const mocks = am.AbstractPluginMocks()
  whenThenRight(mocks.pluginT.stepForId, am.MANUSCRIPT_ID, am.mockManuscriptWithPreprintResponse)
  whenThenRight(mocks.pluginT.stepForId, am.PREPRINT_ID, am.mockPreprintWithManuscriptResponse)

  const routine = stepsForIdRecursive(mocks.plugin, am.MANUSCRIPT_ID, new Set<string>(), {
    inputs: nothing,
  })

  const res = await routine()
  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  const steps = res.right.all
  t.is(steps.length, 2)

  t.deepEqual(steps[0]?.actions[0]?.inputs, [])
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.id, am.PREPRINT_ID)
  t.deepEqual(steps[1]?.actions[0]?.inputs[0]?.id, am.PREPRINT_ID)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.id, am.MANUSCRIPT_ID)
  //TODO: can write stronger assertions as we learn what this should look like
})

test('happy-path scenario: a manuscript discovered from its preprint', async (t) => {
  const mocks = am.AbstractPluginMocks()
  whenThenRight(mocks.pluginT.stepForId, am.PREPRINT_ID, am.mockPreprintWithManuscriptResponse)
  whenThenRight(mocks.pluginT.stepForId, am.MANUSCRIPT_ID, am.mockManuscriptWithPreprintResponse)

  const routine = stepsForIdRecursive(mocks.plugin, am.PREPRINT_ID, new Set<string>(), {
    inputs: nothing,
  })

  const res = await routine()
  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  const steps = res.right.all
  t.is(steps.length, 2)

  t.deepEqual(steps[0]?.actions[0]?.inputs, [])
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.id, am.PREPRINT_ID)
  t.deepEqual(steps[1]?.actions[0]?.inputs[0]?.id, am.PREPRINT_ID)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.id, am.MANUSCRIPT_ID)
  //TODO: can write stronger assertions as we learn what this should look like
})

test('happy-path scenario: a manuscript with no relations', async (t) => {
  const mocks = am.AbstractPluginMocks()
  whenThenRight(mocks.pluginT.stepForId, am.MANUSCRIPT_ID, am.mockManuscriptResponse)

  const routine = stepsForIdRecursive(mocks.plugin, am.MANUSCRIPT_ID, new Set<string>(), {
    inputs: nothing,
  })

  const res = await routine()
  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${res.left}`)
    return
  }

  const steps = res.right.all
  t.is(steps.length, 1)

  t.deepEqual(steps[0]?.actions[0]?.inputs, [])
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.id, am.MANUSCRIPT_ID)
})

test('happy-path scenario: a manuscript with 2 reviews and no preprint', async (t) => {
  const mocks = am.AbstractPluginMocks()
  whenThenRight(mocks.pluginT.stepForId, am.MANUSCRIPT_ID, am.mockManuscriptWithReviewsResponse)
  whenThenRight(mocks.pluginT.actionForReviewId, am.REVIEW_1_ID, am.reviewActions[0])
  whenThenRight(mocks.pluginT.actionForReviewId, am.REVIEW_2_ID, am.reviewActions[1])

  const routine = stepsForIdRecursive(mocks.plugin, am.MANUSCRIPT_ID, new Set<string>(), {
    inputs: nothing,
  })

  const res = await routine()
  if (isLeft(res)) {
    t.fail(`Got error instead of steps: ${inspect(res.left, { depth: null })}`)
    return
  }

  const steps = res.right.all
  t.is(steps.length, 2)

  t.deepEqual(steps[0]?.actions[0]?.inputs, [])
  t.deepEqual(steps[0]?.actions[0]?.outputs[0]?.id, am.MANUSCRIPT_ID)

  t.deepEqual(steps[1]?.actions[0]?.inputs[0]?.id, am.MANUSCRIPT_ID)
  t.deepEqual(steps[1]?.actions[0]?.outputs[0]?.id, am.REVIEW_1_ID)

  t.deepEqual(steps[1]?.actions[1]?.outputs[0]?.id, am.REVIEW_2_ID)
})

test('error case: if the plugin produces an error ', async (t) => {
  const mocks = am.AbstractPluginMocks()
  when(mocks.pluginT.stepForId).thenReturn(() => TE.left(new Error('fake error!!')))
  const routine = stepsForIdRecursive(mocks.plugin, am.MANUSCRIPT_ID, new Set<string>(), {
    inputs: nothing,
  })

  const res = await routine()

  if (isRight(res)) {
    t.fail(`Got docmaps instead of error: ${res.right}`)
    return
  }

  t.regex(res.left.message, /fake error!!/)
})
