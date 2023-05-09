import { when, deepEqual } from 'ts-mockito'

export function testCrossrefDate() {
  const now = new Date(0)
  return {
    'date-parts': [[now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()]],
    'date-time': now.toISOString(),
    timestamp: now.valueOf(),
  }
}

export function whenThenResolve<T, V>(functor: (input: T) => Promise<V>, filter: T, response: V) {
  when(functor(deepEqual(filter))).thenResolve(response)
}
