import { isRight, Either } from 'fp-ts/lib/Either'

export function rightAnd<T>(e: Either<unknown, T>, validation: (res: T) => void) {
  if (isRight(e)) {
    validation(e.right)
    return true
  } else {
    return false
  }
}
