import { when, deepEqual } from 'ts-mockito'

export function testCrossrefDate() {
  const now = new Date()
  return {
    'date-parts': [[now.getFullYear(), now.getMonth(), now.getDay()]],
    'date-time': now.toISOString(),
    timestamp: now.valueOf(),
  }
}

export function whenThenResolve<T, V>(functor: (input: T) => Promise<V>, filter: T, response: V) {
  when(functor(deepEqual(filter))).thenResolve(response)
}
