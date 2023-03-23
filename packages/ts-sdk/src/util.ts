import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain } from 'fp-ts/lib/Either'

/** URL from String parser
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts-types/blob/master/src/BooleanFromString.ts
 */

export type UrlFromStringC = t.Type<URL, string, unknown>

export const UrlFromString: UrlFromStringC = new t.Type<URL, string, unknown>(
  'UrlFromString',
  (u): u is URL => u instanceof URL,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      chain((s) => {
        try {
          const url = new URL(s)
          return t.success(url)
        } catch (e) {
          return t.failure(u, c)
        }
      }),
    ),
  String,
)
