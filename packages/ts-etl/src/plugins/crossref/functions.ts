import { Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import type { ErrorOrDocmap } from '../../types'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from 'docmaps-sdk'

export function thingForCrossrefWork(work: Work) {
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

function nameForAuthor(a: { family: string; name?: string; given?: string }): string {
  // FIXME this seems presumptuous
  return a.name || (a.given ? `${a.family}, ${a.given}` : a.family)
}

export function decodeActionForWork(work: Work): E.Either<Error, D.DocmapActionT> {
  return pipe(
    E.Do,
    E.bind('wo', () => pipe(work, thingForCrossrefWork, E.right)),
    E.bind('wa', () =>
      pipe(
        work.author || [],
        A.map((a) => ({
          type: 'person',
          name: nameForAuthor(a),
        })),
        E.traverseArray((a) => leftToStrError(D.DocmapActor.decode(a))),
        E.map((auths) =>
          auths.map((a) => ({
            actor: a,
            role: 'author',
          })),
        ),
      ),
    ),
    E.chain(({ wo, wa }) =>
      pipe(
        {
          participants: wa,
          outputs: [wo],
        },
        D.DocmapAction.decode,
        leftToStrError,
      ),
    ),
  )
}

export function stepArrayToDocmap(
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
export const leftToStrError = E.mapLeft((e: unknown) => {
  if (e instanceof Error) {
    return e
  }

  return new Error('unknown error', { cause: e })
})
