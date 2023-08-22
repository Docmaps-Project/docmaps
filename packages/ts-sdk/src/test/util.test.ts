import test from 'ava'
import { DateFromUnknown, UrlFromString, ArrayUpsertedEmpty } from '../util'
import * as iots from 'io-ts'
import { isRight, Either } from 'fp-ts/lib/Either'

function rightAnd<T>(e: Either<unknown, T>, validation: (res: T) => void) {
  if (isRight(e)) {
    validation(e.right)
    return true
  } else {
    return false
  }
}

test('UrlFromString success cases', (t) => {
  const url1 = UrlFromString.decode('https://docmaps.knowledgefutures.org')
  t.true(
    rightAnd(url1, (u) => {
      t.is(u.host, 'docmaps.knowledgefutures.org')
      t.is(u.protocol, 'https:')
    }),
  )

  const url2 = UrlFromString.decode('file:///tmp/some-file.txt')
  t.true(
    rightAnd(url2, (u) => {
      t.is(u.pathname, '/tmp/some-file.txt')
      t.is(u.protocol, 'file:')
    }),
  )

  const url3 = UrlFromString.decode('http://localhost:8080/?someQuery=true')
  t.true(
    rightAnd(url3, (u) => {
      t.is(u.hostname, 'localhost')
      t.is(u.protocol, 'http:')
      t.is(u.port, '8080')
      t.is(u.search, '?someQuery=true')
    }),
  )
})

test('UrlFromString failure cases', (t) => {
  const url1 = UrlFromString.decode('NOT_A_URL')
  t.false(isRight(url1))

  const url2 = UrlFromString.decode(409)
  t.false(isRight(url2))

  const url3 = UrlFromString.decode({})
  t.false(isRight(url3))
})

test('DateFromUnknown success cases', (t) => {
  const d1 = DateFromUnknown.decode(new Date(0))
  t.true(
    rightAnd(d1, (d) => {
      t.is(d.valueOf(), 0)
      t.is(d.getUTCFullYear(), 1970)
      t.is(DateFromUnknown.encode(d), '1970-01-01T00:00:00.000Z')
    }),
  )

  const d2 = DateFromUnknown.decode(0)
  t.true(
    rightAnd(d2, (d) => {
      t.is(d.valueOf(), 0)
      t.is(d.getUTCFullYear(), 1970)
      t.is(DateFromUnknown.encode(d), '1970-01-01T00:00:00.000Z')
    }),
  )

  const d4 = DateFromUnknown.decode('1970-01-01T00:00:00.000Z')
  t.true(
    rightAnd(d4, (d) => {
      t.is(d.valueOf(), 0)
      t.is(d.getUTCFullYear(), 1970)
      t.is(DateFromUnknown.encode(d), '1970-01-01T00:00:00.000Z')
    }),
  )
})

test('DateFromUnknown failure cases', (t) => {
  const d1 = DateFromUnknown.decode('NOT_A_DATE')
  t.false(isRight(d1))

  const d2 = DateFromUnknown.decode(undefined)
  t.false(isRight(d2))

  const d4 = DateFromUnknown.decode({ some: 'thing' })
  t.false(isRight(d4))
})

test('ArrayUpsertedEmpty success cases', (t) => {
  const a1 = ArrayUpsertedEmpty(iots.string).decode(['one', 'two'])
  t.true(
    rightAnd(a1, (a) => {
      t.deepEqual(a, ['one', 'two'])
    }),
  )

  const a2 = ArrayUpsertedEmpty(iots.string).decode(null)
  t.true(
    rightAnd(a2, (a) => {
      t.deepEqual(a, [])
    }),
  )

  const a3 = iots
    .type({
      something: ArrayUpsertedEmpty(iots.number),
    })
    .decode({})
  t.true(
    rightAnd(a3, (a) => {
      t.deepEqual(a, { something: [] })
    }),
  )
})

test('ArrayUpsertedEmpty failure cases', (t) => {
  const a1 = ArrayUpsertedEmpty(iots.string).decode([1, 2, 3])
  t.false(isRight(a1))

  const a2 = ArrayUpsertedEmpty(iots.string).decode('single value')
  t.false(isRight(a2))

  const a3 = iots
    .partial({
      something: ArrayUpsertedEmpty(iots.number),
    })
    .decode({ something: ['string not number'] })
  t.false(isRight(a3))
})
