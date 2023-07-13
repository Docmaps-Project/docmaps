import * as TE from 'fp-ts/lib/TaskEither'
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

export function whenThenRight<T, E, V>(
  functor: (input1: T) => TE.TaskEither<E, V>,
  filter: T,
  response: V,
) {
  when(functor(deepEqual(filter))).thenReturn(TE.of(response))
}

export function whenThenRight2<T, U, E, V>(
  functor: (input1: T, input2: U) => TE.TaskEither<E, V>,
  filter: [T, U],
  response: V,
) {
  when(functor(deepEqual(filter[0]), deepEqual(filter[1]))).thenReturn(TE.of(response))
}
