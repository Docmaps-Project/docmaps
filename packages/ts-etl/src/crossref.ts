import {
  CreateCrossrefClient,
  CrossrefClient,
  Work,
  DatemorphISOString,
} from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import type { ErrorOrDocmap } from './types'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from 'docmaps-sdk'
import { eqString } from 'fp-ts/lib/Eq'

// TODO: force consumers of this library to supply a polite-mailto
const Client = CreateCrossrefClient({})

function thingForCrossrefWork(work: Work) {
  return {
    // TODO: should we include arbitrary keys? make that parametric?
    // ...work,
    // FIXME: is this possibly fake news? should it fail instead if no published date?
    published: DatemorphISOString(work.published || work.created),
    doi: work.DOI,
    type: work.type,
    // TODO: other fields we ignore: id, content
  }
}

function decodeActionForWork(work: Work): E.Either<Error, D.DocmapActionT> {
  const errors: Error[] = []
  const workAuthors = (work.author || []).map((a) => {
    // TODO this whole code block shows why better use of fp-ts chaining is needed
    const auth = D.DocmapActor.decode({
      type: 'person',
      name: a.name || `${a.family}, ${a.given}` || '', // FIXME this seems presumptuous
    })
    if (E.isLeft(auth)) {
      errors.push(new Error('unable to parse work author', { cause: auth.left }))
      return // undefined behavior because exits later
    }

    return {
      actor: auth.right,
      role: 'author',
    }
  })

  if (errors.length > 0) {
    return E.left(new Error('unable to parse work authors', { cause: errors }))
  }

  const workObject = thingForCrossrefWork(work)
  const workAction = D.DocmapAction.decode({
    participants: workAuthors,
    outputs: [workObject],
  })

  if (E.isLeft(workAction)) {
    return E.left(new Error('unable to parse work action', { cause: workAction.left }))
  }

  return E.right(workAction.right)
}

// NOTE: possibly this wants to be in the core sdk, but because docmaps
// contain info about authorship, i am not so sure --- might require too
// much configuration.
//
// This is slightly sane because while steps have keys like `first-step`
// and `next-step`, these keys do not mean anything outside context of docmap.
// possibly long term this makes a case for rdf-star.
function stepArrayToDocmap(
  inputDoi: string,
  [firstStep, ...steps]: D.DocmapStepT[],
): ErrorOrDocmap {
  // TODO: extract this
  const dm_id = `https://docmaps-project.github.io/ex/docmap_for/${inputDoi}`

  const now = new Date()

  let bnodeId = 0

  const dmBody = {
    type: 'docmap',
    id: dm_id,
    publisher: {
      // FIXME: fill this in
    },
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

  const reduction = steps.reduce<E.Either<Error, Record<string, D.DocmapStepT>>>(
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
    E.right({
      '_:b0': firstStep,
    }),
  )

  if (E.isLeft(reduction)) {
    return reduction
  }
  const dmObject = D.Docmap.decode({
    ...dmBody,
    'first-step': '_:b0',
    steps: reduction.right,
  })

  if (E.isLeft(dmObject)) {
    return E.left(new Error('unable to parse manuscript step', { cause: dmObject.left }))
  }

  return E.right([dmObject.right])
}

// FIXME this is a weak upcast - use t.Errors more effectively in ts-sdk
const leftToStrError = E.mapLeft((e: unknown) => new Error(String(e)))

function actionForReviewDOI(
  client: CrossrefClient,
  doi: string,
): TE.TaskEither<Error, D.DocmapActionT> {
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

// This type is needed because the recursion may produce steps in
// order with review step last, but the preprint step must be
// known to the recursing caller. This is awkward but workable
// for now without going all the way to a graphy representation
// in this procedure.
type RecursiveStepDataChain = {
  head: D.DocmapStepT
  all: D.DocmapStepT[]
}

function stepsForDoiRecursive(
  client: CrossrefClient,
  inputDoi: string,
  status: string,
): TE.TaskEither<Error, RecursiveStepDataChain> {
  const service = client.works
  const program = pipe(
    TE.Do,
    TE.bind('w', () =>
      TE.tryCatch(
        () => service.getWorks({ doi: inputDoi }), // FIXME throw/reject if not status OK ? (what is client behavior if not 200?)
        (reason: unknown) =>
          new Error(`failed to fetch crossref body for DOI ${inputDoi}`, { cause: reason }),
      ),
    ),
    // 1. get step for this
    TE.bind('initialChain', ({ w }) =>
      pipe(
        w.message,
        decodeActionForWork,
        E.map((action) => ({
          inputs: [], // TODO: confirm we always override this as needed
          actions: [action],
          assertions: [
            {
              status: status, //TODO : choose this key carefully
              item: w.message.DOI,
            },
          ],
        })),
        E.chain((action) => pipe(D.DocmapStep.decode(action), leftToStrError)),
        E.map((s) => ({
          all: [s],
          head: s,
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
          return wre['id-type'].toLowerCase() == 'doi'
        }),
        // get unique IDs
        A.map((wre) => wre.id),
        A.uniq(eqString),
        TE.traverseArray((wreId) => {
          return stepsForDoiRecursive(client, wreId, 'catalogued') // TODO: status for any preprint
        }),
        TE.map((meta) => {
          // this is array of DataChain.
          // the output `head` should have all the `head` outputs as inputs.
          // the output `all` should have concatenation of alls, plus the new Head.

          const newStep = {
            ...initialChain.head,
            inputs: meta.reduce<D.DocmapThingT[]>(
              (memo, c) =>
                memo.concat(
                  c.head.actions.reduce<D.DocmapThingT[]>((m, a) => m.concat(a.outputs), []),
                ),
              [],
            ),
          }

          return {
            head: newStep,
            all: meta.reduce<D.DocmapStepT[]>((m, c) => m.concat(c.all), []).concat([newStep]),
          }
        }),
      )
    }),
    TE.bind('completeChain', ({ w, prefixChain }) => {
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
        TE.chainEitherK((rs) => leftToStrError(D.DocmapStep.decode(rs))),
        TE.map((reviewStep) => ({
          head: prefixChain.head,
          all: prefixChain.all.concat([reviewStep]),
        })),
      )
    }),
    TE.map(({ completeChain }) => completeChain),
  )

  return program
}

async function fetchPublicationByDoi(
  client: CrossrefClient,
  inputDoi: string,
): Promise<ErrorOrDocmap> {
  const resultTask = pipe(
    stepsForDoiRecursive(client, inputDoi, 'published'),
    TE.chain((steps) => {
      return pipe(stepArrayToDocmap(inputDoi, steps.all), TE.fromEither)
    }),
  )

  return await resultTask()
}

export { fetchPublicationByDoi, Client }
