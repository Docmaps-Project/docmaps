import * as D from 'docmaps-sdk'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import {pipe} from 'fp-ts/lib/function'
import * as t from 'io-ts'
import util from "util";
import { readFileSync } from 'fs';

// program starts
console.log("\n\n---Docmaps exploration in TS---\n\n")

// get a file as string (this could be an API response on a browser)
const file = readFileSync('./docmap.jsonld', 'utf-8');

//-- equivalent to:
// const program = D.Docmap.decode(JSON.parse(file)) followed by more computation

const program = pipe(
  // any value as input
  file,
  // function that takes that value as only argument
  JSON.parse,
  // function that takes the return of previous as only argument
  // this one returns an E.Either<Error, Docmap> (actually, with a subtype of Error)
  D.Docmap.decode,

  // here we mean "map" not across a collection but across the monadic Either type
  // it maps the function provided against the success case (when we did get a docmap)
  E.map((d) => (d.steps ? Object.values(d.steps): [])),

  // likewise, we map again. But now the success case contains an array, so we use
  // the standard array flatMap to produce a new array based on subarrays.
  E.map(A.flatMap((s) => s.actions)),

  // likewise, but more complex.
  E.map(A.map((a) => pipe(
    a.participants,
    // note the use of `any` here, which is because the `actor` field
    // currently doesn't have any obligatory fields. This leaks the
    // type safety slightly by assuming there is a `name`. Improvements
    // to the `docmaps-sdk` based on narrower specification or even more
    // involved parsing in the consumer library (like this script) can
    // provide further safety.
    A.map((p) => (p.actor as any).name)
  ))),
)


// -- In Functional programming, we "return errors" rather than throwing.
//    For this demo, I will unwrap that pattern here to show the outcome.
if(E.isLeft(program)) {
  throw new Error("input was invalid docmap!", {cause: program.left})
} else {
  console.log(util.inspect(program.right, {depth: 2, colors: true}))
}














