import * as D from 'docmaps-sdk'
import type { Plugin, RecursiveStepDataChain } from './types'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import { stepArrayToDocmap, mapLeftToUnknownError } from './utils'
import type { ErrorOrDocmap } from './types'

// zeroth version -- just abstract away the `prev` and `next` stuff. Inject the "plugin module" which
// can tell you whether there are Next and Previous nodes.

// TODO: this is the thing to make generic. This behavior is an algorithm for
// iteratively building  a tree/graph of the docmap while serializing it
// to a step array. The strategy for ordering steps and compressing them
// is quite arbitrary and brittle.
export function stepsForIdRecursive<ID extends D.IRI, P extends Plugin<ID>>(
  plugin: P,
  id: ID,
  visitedIds: Set<ID>,
  annotations: {
    inputs: D.ThingT[]
  },
): TE.TaskEither<Error, RecursiveStepDataChain<ID>> {
  const program = pipe(
    TE.Do,
    // 1. get step for this, and additional nodes to search
    TE.bind('isrForId', () => {
      return pipe(
        id,
        plugin.stepForId,
        TE.map((isr) => ({
          ...isr,
          step: {
            ...isr.step,
            actions: isr.step.actions.map((a) => ({
              ...a,
              inputs: annotations.inputs,
            })),
          },
        })),
      )
    }),
    TE.bind('initialChain', ({ isrForId }) =>
      TE.of({
        head: isrForId.step,
        all: [isrForId.step],
        visitedIds: visitedIds.add(id),
      }),
    ),
    TE.bind('prefixChain', ({ isrForId, initialChain }) =>
      pipe(
        // 2. if there is a preprint recurse
        isrForId.preprints,
        // get unique IDs
        A.filter((preprintId) => !initialChain.visitedIds.has(preprintId)),
        TE.traverseSeqArray((preprintId) => {
          return stepsForIdRecursive(plugin, preprintId, initialChain.visitedIds, {
            inputs: [],
          })
        }),
        TE.map((meta) => {
          // this is array of DataChain.
          // the output `head` should have all the in-array `head` outputs as inputs.
          // the output `all` should have concatenation of alls, plus the new Head.
          const newStep = {
            ...initialChain.head,
            actions: initialChain.head.actions.map((a) => ({
              ...a,
              inputs: meta.reduce<D.ThingT[]>(
                (memo, c) =>
                  memo.concat(c.head.actions.reduce<D.ThingT[]>((m, a) => m.concat(a.outputs), [])),
                a.inputs,
              ),
            })),
          }

          return {
            head: newStep,
            all: meta.reduce<D.StepT[]>((m, c) => m.concat(c.all), []).concat([newStep]),
            visitedIds: meta.reduce<Set<ID>>(
              (m, c) => new Set<ID>([...m, ...c.visitedIds]),
              initialChain.visitedIds,
            ),
          }
        }),
      ),
    ),
    TE.bind('postfixChain', ({ isrForId, initialChain, prefixChain }) => {
      if (isrForId.reviews.length == 0) {
        return TE.of(prefixChain)
      }

      return pipe(
        isrForId.reviews,
        // TODO: this should be batched rather than entirely serialized
        TE.traverseSeqArray((rId) => plugin.actionForReviewId(rId)),
        TE.map((listOfActions) => ({
          actions: listOfActions.map((a) => ({
            ...a,
            inputs: initialChain.head.actions.reduce<D.ThingT[]>((m, a) => m.concat(a.outputs), []),
          })),
          assertions: [
            {
              status: 'reviewed', //TODO: choose this key carefully
              item: String(id),
            },
          ],
        })),
        TE.chainEitherK((rs) => pipe(rs, D.Step.decode, mapLeftToUnknownError('decoding step'))),
        TE.map((reviewStep) => ({
          head: prefixChain.head,
          all: prefixChain.all.concat([reviewStep]),
          // TODO: consider whether we want to include the review DOIs in the visitedIds
          // - sometimes the Review is marked `is-review-of` both the preprint and manuscript
          visitedIds: new Set<ID>([...prefixChain.visitedIds, ...isrForId.reviews]),
        })),
      )
    }),
    TE.bind('completeChain', ({ isrForId, postfixChain }) => {
      return pipe(
        isrForId.manuscripts,
        A.filter((manId) => !postfixChain.visitedIds.has(manId)),
        // get unique IDs
        TE.traverseArray((manId) => {
          return stepsForIdRecursive(plugin, manId, postfixChain.visitedIds, {
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
            visitedIds: meta.reduce<Set<ID>>(
              (m, c) => new Set<ID>([...m, ...c.visitedIds]),
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

export async function process<ID extends D.IRI>(
  // FIXME: the point of this encapsulation is to enable the Processor to handle the recursion eventually
  plug: Plugin<ID>,
  publisher: D.PublisherT,
  id: ID,
): Promise<ErrorOrDocmap> {
  const program = pipe(
    id,
    () => stepsForIdRecursive(plug, id, new Set<ID>(), { inputs: [] }),
    TE.chainEitherK((steps) => stepArrayToDocmap(publisher, id, steps.all)),
  )

  return await program()
}
