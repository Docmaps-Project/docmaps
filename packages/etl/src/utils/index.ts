import * as D from '@docmaps/sdk'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import type { ErrorOrDocmap } from '../types'

/*   *******
 *    Utils
 *   *******
 *
 *  This package contains utility functions that are good candidates for
 *  adoption into the core SDK but currently have only known uses in this
 *  ETL package.
 */

/** mapLeftToUnknownError - helper function for interoperating between Either types
 *
 * specifically, io-ts codecs are always of type Either<ValidationError[], T>, and that
 * validation error is not naturally upcastable to Error where we use Either<Error, T>.
 */
export const mapLeftToUnknownError = (m = 'unknown error in @docmaps/etl') =>
  E.mapLeft((e: unknown) => {
    return new Error(`error: ${m}`, { cause: e })
  })

export function nameForAuthor(a: { family: string; name?: string; given?: string }): string {
  // FIXME this seems presumptuous
  return a.name || (a.given ? `${a.family}, ${a.given}` : a.family)
}

// NOTE: possibly this wants to be in the core sdk, but because docmaps
// contain info about authorship, i am not so sure --- might require too
// much configuration.
//
// This is slightly sane because while steps have keys like `first-step`
// and `next-step`, these keys do not mean anything outside context of docmap.
// possibly long term this makes a case for rdf-star.

/**
 * stepArrayToDocmap - a helper function that processes a list of steps into a coherent docmap
 *
 * This function is needed because while a recursive process can produce a list of steps,
 * those steps are not inherently doubly-linked the way they need to be in a docmap.
 * (i.e., the Steps are each created independent from each other based on the crossref
 *   data for each DOI, but they need to be connected when they become a Workflow.)
 * we additionally insert any step-independent info that is pertinent to the docmap, such as
 * the Publisher of the docmap.
 *
 * This is an awkward moment that breaks some of the functional abstraction (see comments).
 */
export function stepArrayToDocmap(
  publisher: D.PublisherT,
  inputDoi: string,
  [firstStep, ...steps]: D.StepT[],
): ErrorOrDocmap {
  // TODO: extract this logic
  const dm_id = `https://docmaps-project.github.io/ex/docmap_for/${inputDoi}`

  const now = new Date()

  let bnodeId = 0

  const dmBody = {
    type: 'docmap',
    id: dm_id,
    publisher: publisher,
    created: now, // FIXME does it have to be a string?
    updated: now, // FIXME does it have to be a string?
  }

  if (!firstStep) {
    const dmObject = D.Docmap.decode(dmBody)

    if (E.isLeft(dmObject)) {
      return E.left(new Error('unable to parse manuscript step', { cause: dmObject.left }))
    }

    return E.right([dmObject.right])
  }

  // this reduction takes advantage of the fact that we have separated the firstStep
  // from the ...steps argument, because the first & last step is only singly linked
  //   (see the last argument to #reduce).
  const reduction = steps.reduce<E.Either<Error, Record<string, D.StepT>>>(
    (memo, next) => {
      if (E.isLeft(memo)) {
        return memo //cascade all errors
      }

      const m = memo.right

      const previousId = `_:b${bnodeId}`
      bnodeId += 1
      const thisId = `_:b${bnodeId}`

      const prev = m[previousId]
      if (!prev) {
        return E.left(
          new Error(
            `algorithm error: step memo was missing step for id ${previousId} but was processing step with id ${thisId}`,
          ),
        )
      }
      m[previousId] = {
        ...prev,
        'next-step': thisId,
      }
      m[thisId] = {
        ...next,
        'previous-step': previousId,
      }

      return E.right(m)
    },
    // initial memo: the first step only, whose next-step is inserted during
    // the reduction loop and who doesn't need a first-step. since the reduce
    // is creating an Either, we begin with an Either that never fails.
    E.right({
      '_:b0': firstStep,
    }),
  )

  return pipe(
    reduction,
    E.map((r) => ({
      ...dmBody,
      'first-step': '_:b0',
      steps: r,
    })),
    E.chain((b) => pipe(b, D.Docmap.decode, mapLeftToUnknownError('decoding docmap'))),
    // requires to output Array of docmap
    E.map((d) => [d]),
  )
}
