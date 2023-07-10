import type { CrossrefClient } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import type { ErrorOrDocmap } from '../../types'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from 'docmaps-sdk'
import { eqString } from 'fp-ts/lib/Eq'
import {
  mapLeftToUnknownError,
  decodeActionForWork,
  stepArrayToDocmap,
  thingForCrossrefWork,
} from './functions'

export { CreateCrossrefClient } from 'crossref-openapi-client-ts'

// This type is needed because the recursion may produce steps in
// order with review step last, but the preprint step must be
// known to the recursing caller. This is awkward but workable
// for now without going all the way to a graphy representation
// in this procedure.
type RecursiveStepDataChain = {
  head: D.StepT
  all: D.StepT[]
  visitedIds: Set<string>
}

function stepsForDoiRecursive(
  client: CrossrefClient,
  inputDoi: string,
  visitedIds: Set<string>,
  annotations: {
    inputs: D.ThingT[]
  },
): TE.TaskEither<Error, RecursiveStepDataChain> {
  const service = client.works
  const program = pipe(
    TE.Do,
    TE.bind('w', () =>
      TE.tryCatch(
        () => service.getWorks({ doi: inputDoi }),
        (reason: unknown) =>
          new Error(`failed to fetch crossref body for DOI ${inputDoi}`, { cause: reason }),
      ),
    ),
    TE.bind('status', ({ w }) =>
      pipe(
        w,
        (w) => {
          switch (w.message.type) {
            case 'posted-content':
              return E.right('catalogued')
            case 'journal-article':
              return E.right('published')
            default:
              return E.left(
                new Error(`requested root docmap for crossref entity of type '${w.message.type}'`),
              )
          }
        },
        TE.fromEither,
      ),
    ),
    // 1. get step for this
    TE.bind('initialChain', ({ w, status }) =>
      pipe(
        w.message,
        decodeActionForWork,
        E.map((action) => ({
          inputs: annotations.inputs,
          actions: [action],
          assertions: [
            {
              status: status, //TODO : choose this key carefully
              item: w.message.DOI,
            },
          ],
        })),
        E.chain((action) =>
          pipe(
            D.Step.decode(action),
            mapLeftToUnknownError('decoding action in stepsForDoiRecursive'),
          ),
        ),
        E.map((s) => ({
          head: s,
          all: [s],
          visitedIds: visitedIds.add(inputDoi.toLowerCase()),
        })),
        TE.fromEither,
      ),
    ),
    TE.bind('prefixChain', ({ w, initialChain }) => {
      const preprints = w.message.relation?.['has-preprint']
      if (!preprints) {
        return TE.right(initialChain)
      }

      // 2. if there is a preprint recurse
      return pipe(
        preprints,
        A.filter((wre) => {
          return (
            wre['id-type'].toLowerCase() == 'doi' &&
            !initialChain.visitedIds.has(wre['id'].toLowerCase())
          )
        }),
        // get unique IDs
        A.map((wre) => wre.id),
        A.uniq(eqString),
        TE.traverseArray((wreId) => {
          return stepsForDoiRecursive(client, wreId, initialChain.visitedIds, {
            inputs: [],
          })
        }),
        TE.map((meta) => {
          // this is array of DataChain.
          // the output `head` should have all the in-array `head` outputs as inputs.
          // the output `all` should have concatenation of alls, plus the new Head.

          const newStep = {
            ...initialChain.head,
            inputs: meta.reduce<D.ThingT[]>(
              (memo, c) =>
                memo.concat(c.head.actions.reduce<D.ThingT[]>((m, a) => m.concat(a.outputs), [])),
              initialChain.head.inputs,
            ),
          }

          return {
            head: newStep,
            all: meta.reduce<D.StepT[]>((m, c) => m.concat(c.all), []).concat([newStep]),
            visitedIds: meta.reduce<Set<string>>(
              (m, c) => new Set<string>(...m, ...c.visitedIds),
              initialChain.visitedIds,
            ),
          }
        }),
      )
    }),
    TE.bind('postfixChain', ({ w, prefixChain }) => {
      const reviews = w.message.relation?.['has-review']
      if (!reviews) {
        return TE.right(prefixChain)
      }
      return pipe(
        reviews,
        TE.traverseArray((wre) => {
          // TODO: we could collapse this into one Works1 call that fetches all Reviews at once
          if (wre['id-type'].toLowerCase() != 'doi') {
            return TE.left(
              new Error('unable to create step for preprint with identifier that is not DOI', {
                cause: { work: w.message, preprint: wre.id },
              }),
            )
          }
          return actionForReviewDOI(client, wre.id)
        }),
        TE.map((listOfActions) => ({
          actions: listOfActions,
          inputs: [thingForCrossrefWork(w.message)],
          assertions: [
            {
              status: 'reviewed', //TODO: choose this key carefully
              item: w.message.DOI,
            },
          ],
        })),
        TE.chainEitherK((rs) => pipe(rs, D.Step.decode, mapLeftToUnknownError('decoding step'))),
        TE.map((reviewStep) => ({
          head: prefixChain.head,
          all: prefixChain.all.concat([reviewStep]),
          // TODO: consider whether we want to include the review DOIs in the visitedIds
          // - sometimes the Review is marked `is-review-of` both the preprint and manuscript
          visitedIds: prefixChain.visitedIds,
        })),
      )
    }),
    TE.bind('completeChain', ({ w, postfixChain }) => {
      const manuscripts = w.message.relation?.['is-preprint-of']
      if (!manuscripts) {
        return TE.right(postfixChain)
      }

      // 2. if this is a preprint of another manuscript recurse
      return pipe(
        manuscripts,
        A.filter((wre) => {
          return (
            wre['id-type'].toLowerCase() == 'doi' &&
            !postfixChain.visitedIds.has(wre['id'].toLowerCase())
          )
        }),
        // get unique IDs
        A.map((wre) => wre.id),
        A.uniq(eqString),
        TE.traverseArray((wreId) => {
          return stepsForDoiRecursive(client, wreId, postfixChain.visitedIds, {
            // all the outputs of all the actions of the head
            inputs: postfixChain.head.actions.reduce<D.ThingT[]>((m, a) => m.concat(a.outputs), []),
          })
        }),
        TE.map((meta) => {
          // this is array of DataChain.
          // in this case, we are not manipulating the current head, instead
          // we told the new heads that they have inputs.
          // the output `all` should still have concatenation of alls.

          return {
            head: postfixChain.head,
            all: postfixChain.all.concat(meta.reduce<D.StepT[]>((m, c) => m.concat(c.all), [])),
            visitedIds: meta.reduce<Set<string>>(
              (m, c) => new Set<string>(...m, ...c.visitedIds),
              postfixChain.visitedIds,
            ),
          }
        }),
      )
    }),
    // we return a complete chain, but the head is dropped when recursion is finished and we just consider `all`.
    TE.map(({ completeChain }) => completeChain),
  )

  return program
}

export async function fetchPublicationByDoi(
  client: CrossrefClient,
  publisher: D.PublisherT,
  inputDoi: string,
): Promise<ErrorOrDocmap> {
  const resultTask = pipe(
    stepsForDoiRecursive(client, inputDoi, new Set<string>(), { inputs: [] }),
    TE.chain((steps) => {
      return pipe(stepArrayToDocmap(publisher, inputDoi, steps.all), TE.fromEither)
    }),
  )

  return await resultTask()
}

// NOTE: possibly this wants to be in the core sdk, but because docmaps
// contain info about authorship, i am not so sure --- might require too
// much configuration.
//
// This is slightly sane because while steps have keys like `first-step`
// and `next-step`, these keys do not mean anything outside context of docmap.
// possibly long term this makes a case for rdf-star.

export function actionForReviewDOI(
  client: CrossrefClient,
  doi: string,
): TE.TaskEither<Error, D.ActionT> {
  const service = client.works
  return pipe(
    TE.tryCatch(
      () => service.getWorks({ doi: doi }), // FIXME throw/reject if not status OK ? (what is client behavior if not 200?)
      (reason: unknown) =>
        new Error(`failed to fetch crossref body for review DOI ${doi}`, { cause: reason }),
    ),
    TE.map((w) => w.message),
    TE.chain((m) => TE.fromEither(decodeActionForWork(m))),
  )
}
