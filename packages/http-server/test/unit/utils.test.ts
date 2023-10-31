import test from 'ava'
import * as util from '../../src/utils'

test('arrayToAsyncIterable', async (t) => {
  const array = [1, 20, 300, 4]
  const iter = util.arrayToAsyncIterable(array)

  let i = 0

  for await (const v of iter) {
    t.is(array[i], v)
    i++
  }
})
