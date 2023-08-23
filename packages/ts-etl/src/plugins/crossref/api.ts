import type { CrossrefClient } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import type { Plugin } from '../../types'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from 'docmaps-sdk'
import { relatedDoisForWork, decodeActionForWork } from './functions'
import { mapLeftToUnknownError } from '../../utils'

export { CreateCrossrefClient } from 'crossref-openapi-client-ts'

export const CrossrefPlugin: (client: CrossrefClient) => Plugin<string> = (
  client: CrossrefClient,
) => {
  const service = client.works
  return {
    stepForId: (id: string) => {
      return pipe(
        TE.Do,
        TE.bind('w', () =>
          TE.tryCatch(
            () => service.getWorks({ doi: id }),
            (reason: unknown) =>
              new Error(`failed to fetch crossref body for DOI ${id}`, { cause: reason }),
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
                    new Error(
                      `requested root docmap for crossref entity of type '${w.message.type}'`,
                    ),
                  )
              }
            },
            TE.fromEither,
          ),
        ),
        // 1. get step for this
        TE.bind('step', ({ w, status }) =>
          pipe(
            w.message,
            decodeActionForWork,
            E.map((action) => ({
              inputs: [],
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
            TE.fromEither,
          ),
        ),
        TE.bind('reviews', ({ w }) => TE.of(relatedDoisForWork(w.message, 'has-review'))),
        TE.bind('manuscripts', ({ w }) => TE.of(relatedDoisForWork(w.message, 'is-preprint-of'))),
        TE.bind('preprints', ({ w }) => TE.of(relatedDoisForWork(w.message, 'has-preprint'))),
        TE.map(({ step, reviews, preprints, manuscripts }) => ({
          step,
          reviews,
          preprints,
          manuscripts,
        })),
      )
    },

    actionForReviewId: (id: string) => {
      return actionForReviewDOI(client, id)
    },
  }
}

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
