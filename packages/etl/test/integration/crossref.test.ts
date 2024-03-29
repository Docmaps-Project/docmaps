import test from 'ava'
import type { DocmapT } from '@docmaps/sdk'
import { MakeCli } from '../../src/command'

type cmdResult = {
  stderr: string
  stdout: string
  error?: Error
}

async function cmdIoResults(args: string): Promise<cmdResult> {
  const cli = MakeCli()
  const stderrLines: Array<string> = []
  const stdoutLines: Array<string> = []

  cli.exitOverride()
  cli.configureOutput({
    writeErr: (str) => stderrLines.push(str),
    writeOut: (str) => stdoutLines.push(str),
  })

  const cmd = cli.parseAsync(args.split(' '), { from: 'user' })

  try {
    await cmd
    return {
      stderr: stderrLines.join('\n'),
      stdout: stdoutLines.join('\n'),
    }
  } catch (e) {
    return {
      stderr: stderrLines.join('\n'),
      stdout: stdoutLines.join('\n'),
      error: e as Error,
    }
  }
}

test('single item from crossref with one preprint deduped', async (t) => {
  const { stdout, error } = await cmdIoResults(
    'item --source crossref-api 10.5194/acp-9-8413-2009 --source.crossrefApi.politeMailto docmaps+testsuite@knowledgefutures.org',
  )

  t.falsy(error)

  const dmArr = JSON.parse(stdout) as Array<DocmapT>

  t.is(dmArr[0]?.['type'], 'docmap')
  t.is(dmArr[0]?.['first-step'], '_:b0')
  t.truthy(dmArr[0]?.['steps'])

  const steps = dmArr[0]?.steps
  if (!steps) {
    t.fail('expected 2 steps')
    return
  }
  t.is(Object.keys(steps).length, 2)

  const firstStepId = dmArr[0]?.['first-step']
  if (!firstStepId) {
    t.fail('expected a first step!')
    return
  }

  const secondStepId = Object.keys(steps).find((s) => s != firstStepId)
  if (!secondStepId) {
    t.fail('expected a second step!')
    return
  }

  t.deepEqual(steps[firstStepId]?.inputs, [])
  t.deepEqual(steps[secondStepId]?.inputs, [])

  t.deepEqual(steps[firstStepId]?.actions[0]?.inputs, [])
  t.deepEqual(steps[secondStepId]?.actions[0]?.inputs, [
    {
      doi: '10.5194/acpd-9-13523-2009',
      published: '2009-06-18T00:00:00.000Z',
      type: 'preprint',
    },
  ])

  t.true(stdout.length < 4000) // depends on the actual example chosen. but this is to prevent regressions from explosions of added keys.
})

test('single item from crossref with no relations', async (t) => {
  const { stdout, error } = await cmdIoResults(
    'item --source crossref-api 10.1016/j.jaac.2016.07.660 --source.crossrefApi.politeMailto docmaps+testsuite@knowledgefutures.org',
  )

  t.falsy(error)

  const dmArr = JSON.parse(stdout) as Array<DocmapT>

  t.is(dmArr[0]?.['type'], 'docmap')
  t.is(dmArr[0]?.['first-step'], '_:b0')
  t.truthy(dmArr[0]?.['steps'])

  const steps = dmArr[0]?.steps
  if (!steps) {
    t.fail('expected 1 steps')
    return
  }
  t.is(Object.keys(steps).length, 1)

  t.true(stdout.length < 4000) // depends on the actual example chosen. but this is to prevent regressions from explosions of added keys.
})

test('single item from crossref with both preprint and reviews', async (t) => {
  const { stdout, error } = await cmdIoResults(
    'item --source crossref-api 10.5194/angeo-40-247-2022 --source.crossrefApi.politeMailto docmaps+testsuite@knowledgefutures.org',
  )

  t.falsy(error)

  const dmArr = JSON.parse(stdout) as Array<DocmapT>

  t.is(dmArr[0]?.['type'], 'docmap')
  t.is(dmArr[0]?.['first-step'], '_:b0')
  t.truthy(dmArr[0]?.['steps'])

  const steps = dmArr[0]?.steps
  if (!steps) {
    t.fail('expected 4 steps')
    return
  }

  t.is(Object.keys(steps).length, 4)
  t.is(steps['_:b0']?.assertions[0]?.['status'], 'catalogued')
  t.is(steps['_:b1']?.assertions[0]?.['status'], 'reviewed')
  t.is(steps['_:b2']?.assertions[0]?.['status'], 'published')
  t.is(steps['_:b3']?.assertions[0]?.['status'], 'reviewed')

  t.true(stdout.length < 5000) // depends on the actual example chosen. but this is to prevent regressions from explosions of added keys.
})

test('item from crossref with complex entanglement does not infinitely recurse', async (t) => {
  const { stdout, error } = await cmdIoResults(
    'item --source crossref-api 10.1130/G50960.1 --source.crossrefApi.politeMailto docmaps+testsuite-recursive@knowledgefutures.org',
  )

  t.falsy(error)

  const dmArr = JSON.parse(stdout) as Array<DocmapT>

  t.is(dmArr[0]?.['type'], 'docmap')
  t.is(dmArr[0]?.['first-step'], '_:b0')
  t.truthy(dmArr[0]?.['steps'])

  const steps = dmArr[0]?.steps
  if (!steps) {
    t.fail('expected 4 steps')
    return
  }

  t.is(Object.keys(steps).length, 4)
  t.is(steps['_:b0']?.assertions[0]?.['status'], 'catalogued')
  t.is(steps['_:b1']?.assertions[0]?.['status'], 'catalogued')
  t.is(steps['_:b2']?.assertions[0]?.['status'], 'catalogued')
  t.is(steps['_:b3']?.assertions[0]?.['status'], 'published')

  t.true(stdout.length < 4000) // depends on the actual example chosen. but this is to prevent regressions from explosions of added keys.
})
