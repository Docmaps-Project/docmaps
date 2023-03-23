import test from 'ava'
import { UrlFromString } from '../util'
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
  t.false( isRight(UrlFromString.decode(url1)))

  const url2 = UrlFromString.decode(409)
  t.false( isRight(UrlFromString.decode(url1)))

  const url3 = UrlFromString.decode({})
  t.false( isRight(UrlFromString.decode(url1)))
})
