import test from 'ava'
import * as D from '../types'
import { PartialExamples as ex } from './__fixtures__'
import * as E from 'fp-ts/lib/Either'
import { Migrate__Step0_14_to_15 } from '../functions'

test('Migrating a step to 0.15.0', (t) => {
  const v = D.Step.decode(ex.elife.Step[1])

  if (E.isLeft(v)) {
    t.fail('expected to decode a Step')
    return
  }

  t.is(v.right.inputs?.length, 1)

  const r = Migrate__Step0_14_to_15(v.right)

  t.deepEqual(r.actions[0]?.inputs, v.right.inputs)
})
