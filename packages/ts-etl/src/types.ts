import type * as E from 'fp-ts/Either'
import type D from 'docmaps-sdk'
import type * as TE from 'fp-ts/lib/TaskEither'

export type ErrorOrDocmap = E.Either<Error, D.DocmapT[]>

// This type is needed because the recursion may produce steps in
// order with review step last, but the preprint step must be
// known to the recursing caller. This is awkward but workable
// for now without going all the way to a graphy representation
// in this procedure.
export type RecursiveStepDataChain<ID extends D.IRI> = {
  head: D.StepT
  all: D.StepT[]
  visitedIds: Set<ID>
}

export type InductiveStepResult<ID extends D.IRI> = {
  step: D.StepT
  preprints: ID[]
  manuscripts: ID[]
  reviews: ID[]
}

export type Plugin<ID extends D.IRI, E = Error> = {
  stepForId: (id: ID, inputs: D.ThingT[]) => TE.TaskEither<E, InductiveStepResult<ID>>
  actionForReviewId: (id: ID) => TE.TaskEither<E, D.ActionT>
}
