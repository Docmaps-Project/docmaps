import test, { ExecutionContext } from 'ava'
import { PartialExamples as ex } from './__fixtures__'
import * as dm from '../types'
import { Either, isLeft, isRight } from 'fp-ts/lib/Either'
import util from 'util'

function isRightArray(t: ExecutionContext, arr: Either<unknown, any>[], len: number) {
  t.is(arr.length, len)

  const res = arr.map((a) => {
    if (isRight(a)) {
      t.pass()
    } else {
      t.fail(`Error parsing: ${util.inspect(a.left, { depth: 18 })}`)
    }
  })
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
  isRightArray(t, v, 2)
})
