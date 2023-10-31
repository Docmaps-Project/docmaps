// utility function
export async function* arrayToAsyncIterable<T>(arr: T[]): AsyncIterable<T> {
  for (const t of arr) {
    yield t
  }
}
