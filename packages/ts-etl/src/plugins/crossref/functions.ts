import { Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
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
  return a.name || (a.given ? `${a.family}, ${a.given}` : a.family)
}

export function decodeActionForWork(work: Work): E.Either<Error, D.DocmapActionT> {
  const errors: Error[] = []
  const workAuthors = (work.author || []).map((a) => {
    // TODO this whole code block shows why better use of fp-ts chaining is needed
    const auth = D.DocmapActor.decode({
      type: 'person',
      name: nameForAuthor(a), // FIXME this seems presumptuous
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

  // const wa = pipe(
  //   work.author || [],
  //   A.map((a) => ({
  //     type: 'person',
  //     name: a.name || `${a.family}, ${a.given}` || '', // FIXME this seems presumptuous
  //   })),
  //   E.traverseArray((a) => leftToStrError(D.DocmapActor.decode(a))),
  //   E.map((auths) => auths.map((a) => ({
  //     actor: a,
  //     role: 'author',
  //   }))),
  // )

  return pipe(
    work,
    thingForCrossrefWork,
    E.right,
    E.map((wo) => ({
      participants: workAuthors,
      outputs: [wo],
    })),
    E.chain((w) => leftToStrError(D.DocmapAction.decode(w))),
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
