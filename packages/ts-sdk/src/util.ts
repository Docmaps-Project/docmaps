/**
 * @since 0.1.0
 */
import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain } from 'fp-ts/lib/Either'
import { fromNullable } from 'io-ts-types'

/**
 * Interface for a codec that parses a string and returns a URL object.
 *
 * @since 0.1.0
 */
export type UrlFromStringC = t.Type<URL, string, unknown>

/**
 * Implementation of URL from String parser
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts-types/blob/master/src/BooleanFromString.ts
 *
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
export type UrlT = t.TypeOf<typeof UrlFromString>

/**
 * Interface for a Date from Anything
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts/blob/master/index.md#custom-types
 *
 * @since 0.9.0
 */
export type DateFromUnknownC = t.Type<Date, string, unknown>

/**
 * Date from Date,Number,orString
 *
 * based on example there:
 *   https://github.com/gcanti/io-ts/blob/master/index.md#custom-types
 *
 * @since 0.9.0
 */
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

/**
 * Function that takes a Codec and returns an "optional array" codec.
 *
 * It fails-over to returning an empty array if the input is null or absent,
 * but still errors if input is present and non matching.
 *
 * @since 0.11.0
 */
export function ArrayUpsertedEmpty<A extends t.Mixed>(item: A) {
  return fromNullable(t.array(item), [])
}
