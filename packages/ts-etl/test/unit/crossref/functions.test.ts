import test, { ExecutionContext } from 'ava'
import * as cm from '../__fixtures__/crossref'
import * as E from 'fp-ts/lib/Either'
import { inspect } from 'util'
import * as F from '../../../src/plugins/crossref/functions'
import type { DocmapActionT } from 'docmaps-sdk'

function rightOrInspectError<T>(
  t: ExecutionContext,
  f: (m: T) => void,
  e: E.Either<Error, T>,
): boolean {
  if (E.isLeft(e)) {
    t.fail(`got unexpected error: ${inspect(e, { depth: 8 })}`)
    return false
  }

  f(e.right)
  return true
}

test('decodeActionForWork: no authors', async (t) => {
  const result = F.decodeActionForWork({
    ...cm.GENERIC_WORK_DATA,
    DOI: 'mock.decodeAction',
    prefix: 'mock',
    URL: 'none',
    author: [],
  })

  t.true(
    rightOrInspectError(
      t,
      (action: DocmapActionT) => {
        t.is(action.outputs[0]?.doi, 'mock.decodeAction')
        t.deepEqual(action.participants, [])
      },
      result,
    ),
  )
})

test('decodeActionForWork: with authors', async (t) => {
  const result = F.decodeActionForWork({
    ...cm.GENERIC_WORK_DATA,
    DOI: 'mock.decodeAction',
    prefix: 'mock',
    URL: 'none',
    author: [
      { family: 'name', affiliation: [], sequence: 'mockseq' },
      { family: 'fam', given: 'first', affiliation: [], sequence: 'mockseq' },
    ],
  })

  t.true(
    rightOrInspectError(
      t,
      (action: DocmapActionT) => {
        t.is(action.outputs[0]?.doi, 'mock.decodeAction')
        t.is(action.participants[0]?.role, 'author')
        t.is(action.participants[1]?.role, 'author')
        t.deepEqual(action.participants[0]?.actor, {
          name: 'name',
          type: 'person',
        })
        t.deepEqual(action.participants[1]?.actor, {
          name: 'fam, first',
          type: 'person',
        })
      },
      result,
    ),
  )
})
