import test, { ExecutionContext } from 'ava'
import { PartialExamples as ex } from './__fixtures__'
import * as dm from '../types'
import * as E from 'fp-ts/lib/Either'
import * as util from 'util'
import { pipe } from 'fp-ts/lib/pipeable'

function isRightArray<T>(
  t: ExecutionContext,
  arr: E.Either<unknown, T>[],
  len: number,
  proc?: (_a: readonly T[]) => void,
) {

  pipe(
    arr,
    E.sequenceArray,
    E.mapLeft((e) => t.fail(`Error parsing: ${util.inspect(e, { depth: 1 })}`)),
    //eslint-disable-next-line
    E.map(proc || (() => {})),
  )

  t.is(arr.length, len)
}

test('Codec parsing OnlineAccount', (t) => {
  const v = ex.elife.OnlineAccount.flatMap((x) => {
    return dm.OnlineAccount.decode(x)
  })
  isRightArray(t, v, 3)
})

test('Codec parsing Publisher', (t) => {
  const v = ex.elife.Publisher.flatMap((x) => {
    return dm.Publisher.decode(x)
  })
  isRightArray(t, v, 4)
})

test('Codec parsing Manifestation', (t) => {
  const v = ex.elife.Manifestation.flatMap((x) => {
    return dm.Manifestation.decode(x)
  })
  isRightArray(t, v, 42)
})

test('Codec parsing Thing', (t) => {
  const v = ex.elife.Thing.flatMap((x) => {
    return dm.Thing.decode(x)
  })
  isRightArray(t, v, 18)
})

test('Codec parsing RoleInTime', (t) => {
  const v = ex.elife.RoleInTime.flatMap((x) => {
    return dm.RoleInTime.decode(x)
  })
  isRightArray(t, v, 19)
})

test('Codec parsing Actor', (t) => {
  const v = ex.elife.Actor.flatMap((x) => {
    return dm.Actor.decode(x)
  })
  isRightArray(t, v, 19)
})

test('Codec parsing Action', (t) => {
  const v = ex.elife.Action.flatMap((x) => {
    return dm.Action.decode(x)
  })
  isRightArray(t, v, 18)
})

test('Codec parsing Assertion', (t) => {
  const v = ex.elife.Assertion.flatMap((x) => {
    return dm.Assertion.decode(x)
  })
  isRightArray(t, v, 10)
})

test('Codec parsing Step', (t) => {
  const v = ex.elife.Step.flatMap((x) => {
    return dm.Step.decode(x)
  })
  isRightArray(t, v, 9)
})

test('Codec parsing Docmap', (t) => {
  const v = ex.elife.Docmap.flatMap((x) => {
    return dm.Docmap.decode(x)
  })
  isRightArray(t, v, 4, (arr) => {
    t.deepEqual(arr[0]?.['@context'], 'https://w3id.org/docmaps/context.jsonld')
  })
})

test('Codec inserts missing @context key for Docmap', (t) => {
  const v = ex.elife.Docmap.flatMap((x) => {
    const { ['@context']: _, ...stripped } = x
    return dm.Docmap.decode(stripped)
  })
  isRightArray(t, v, 4, (arr) => {
    t.deepEqual(arr[0]?.['@context'], 'https://w3id.org/docmaps/context.jsonld')
  })
})
