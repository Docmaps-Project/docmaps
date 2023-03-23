/**
 * @since 0.1.0
 */
import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain } from 'fp-ts/lib/Either'

/**
 * @since 0.1.0
 */
export type UrlFromStringC = t.Type<URL, string, unknown>

/**
 * URL from String parser
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts-types/blob/master/src/BooleanFromString.ts
 * @since 0.1.0
 */
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

/**
 * Should be the same as a URL.
 *
 * @since 0.1.0
 */
export type UrlT = t.TypeOf<typeof UrlFromString>;

/** Date from Anything
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts/blob/master/index.md#custom-types
 */

export type DateFromUnknownC = t.Type<Date, string, unknown>

export const DateFromUnknown: DateFromUnknownC = new t.Type<Date, string, unknown>(
  'DateFromUnknown',
  (input: unknown): input is Date => input instanceof Date,
  (input, context) => {
    if (typeof input === 'string' || typeof input === 'number' || input instanceof Date) {
      const date = new Date(input)
      if (!isNaN(date.getTime())) {
        return t.success(date)
      }
    }
    return t.failure(input, context, 'Invalid date-like input')
  },
  (date: Date) => date.toISOString(),
)
