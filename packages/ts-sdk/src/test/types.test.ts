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
  t.is(arr.length, len)

  pipe(
    arr,
    E.sequenceArray,
    E.mapLeft((e) => t.fail(`Error parsing: ${util.inspect(e, { depth: 18 })}`)),
    //eslint-disable-next-line
    E.map(proc || (() => {})),
  )
}

test('Codec parsing DocmapOnlineAccount', (t) => {
  const v = ex.elife.DocmapOnlineAccount.flatMap((x) => {
    return dm.DocmapOnlineAccount.decode(x)
  })
  isRightArray(t, v, 1)
})

test('Codec parsing DocmapPublisher', (t) => {
  const v = ex.elife.DocmapPublisher.flatMap((x) => {
    return dm.DocmapPublisher.decode(x)
  })
  isRightArray(t, v, 2)
})

test('Codec parsing DocmapManifestation', (t) => {
  const v = ex.elife.DocmapManifestation.flatMap((x) => {
    return dm.DocmapManifestation.decode(x)
  })
  isRightArray(t, v, 21)
})

test('Codec parsing DocmapThing', (t) => {
  const v = ex.elife.DocmapThing.flatMap((x) => {
    return dm.DocmapThing.decode(x)
  })
  isRightArray(t, v, 9)
})

test('Codec parsing DocmapRoleInTime', (t) => {
  const v = ex.elife.DocmapRoleInTime.flatMap((x) => {
    return dm.DocmapRoleInTime.decode(x)
  })
  isRightArray(t, v, 9)
})

test('Codec parsing DocmapActor', (t) => {
  const v = ex.elife.DocmapActor.flatMap((x) => {
    return dm.DocmapActor.decode(x)
  })
  isRightArray(t, v, 9)
})

test('Codec parsing DocmapAction', (t) => {
  const v = ex.elife.DocmapAction.flatMap((x) => {
    return dm.DocmapAction.decode(x)
  })
  isRightArray(t, v, 9)
})

test('Codec parsing DocmapAssertion', (t) => {
  const v = ex.elife.DocmapAssertion.flatMap((x) => {
    return dm.DocmapAssertion.decode(x)
  })
  isRightArray(t, v, 6)
})

test('Codec parsing DocmapStep', (t) => {
  const v = ex.elife.DocmapStep.flatMap((x) => {
    return dm.DocmapStep.decode(x)
  })
  isRightArray(t, v, 5)
})

test('Codec parsing Docmap', (t) => {
  const v = ex.elife.Docmap.flatMap((x) => {
    return dm.Docmap.decode(x)
  })
  isRightArray(t, v, 2, (arr) => {
    t.deepEqual(arr[0]?.['@context'], 'https://w3id.org/docmaps/context.jsonld')
  })
})

test('Codec inserts missing @context key for Docmap', (t) => {
  const v = ex.elife.Docmap.flatMap((x) => {
    const { ['@context']: _, ...stripped } = x
    return dm.Docmap.decode(stripped)
  })
  isRightArray(t, v, 2, (arr) => {
    t.deepEqual(arr[0]?.['@context'], 'https://w3id.org/docmaps/context.jsonld')
  })
})
