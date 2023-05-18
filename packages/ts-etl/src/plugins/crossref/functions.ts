import { Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import type { ErrorOrDocmap } from '../../types'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from 'docmaps-sdk'
import { ContextUpsert } from 'docmaps-sdk'


/**
 * Mappings from strings used in Crossref that are not in Docmaps semantics.
 *
 * see comments for individual elements.
 */
const typeOverrides: Record<string, string> = {
  /*
   * So far we have only found `has-preprint` pointing to
   * objects of type `posted-content`. Unclear if this is
   * a bijective relationship. TODO: take note if we discover
   * cases where we wrongly mark things as Preprints because of this.
   */
  'posted-content': 'preprint',

  /*
   * We chose our terminology out of the FaBio ontologies, In these ontologies
   * the review object does not concern itself with whether the review is a
   * Peer Review or not. That information might appear in where we mark
   * the Acquired Status as `peer-reviewed` or similar, in `assertions`.
   */
  'peer-review': 'review',
}

function overrideContentType(contentType: string): string {
  return typeOverrides[contentType] || contentType
}

export function thingForCrossrefWork(work: Work) {
  return {
    // TODO: should we include arbitrary keys? make that parametric?
    // ...work,
    // FIXME: is this possibly fake news? should it fail instead if no published date?
    published: DatemorphISOString(work.published || work.created),
    doi: work.DOI,
    type: overrideContentType(work.type),
    // TODO: other fields we ignore: id, content
  }
}

function nameForAuthor(a: { family: string; name?: string; given?: string }): string {
  // FIXME this seems presumptuous
  return a.name || (a.given ? `${a.family}, ${a.given}` : a.family)
}

export function decodeActionForWork(work: Work): E.Either<Error, D.ActionT> {
  return pipe(
    E.Do,
    // prepare the Thing which will be output
    E.bind('wo', () => pipe(work, thingForCrossrefWork, E.right)),
    // prepare the Authors
    E.bind('wa', () =>
      pipe(
        work.author || [],
        A.map((a) => ({
          type: 'person',
          name: nameForAuthor(a),
        })),
        E.traverseArray((a) => mapLeftToUnknownError(D.Actor.decode(a))),
        E.map((auths) =>
          auths.map((a) => ({
            actor: a,
            role: 'author',
          })),
        ),
      ),
    ),
    // construct and decode the Action
    E.chain(({ wo, wa }) =>
      pipe(
        {
          participants: wa,
          outputs: [wo],
        },
        D.Action.decode,
        mapLeftToUnknownError,
      ),
    ),
  )
}

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
    E.chain((b) => pipe(b, D.Docmap.decode, mapLeftToUnknownError)),
    // requires to output Array of docmap
    E.map((d) => [d]),
  )
}

/** mapLeftToUnknownError - helper function for interoperating between Either types
 *
 * specifically, io-ts codecs are always of type Either<ValidationError[], T>, and that
 * validation error is not naturally upcastable to Error where we use Either<Error, T>.
 */
export const mapLeftToUnknownError = E.mapLeft((e: unknown) => {
  if (e instanceof Error) {
    return e
  }

  return new Error('unknown error', { cause: e })
})
