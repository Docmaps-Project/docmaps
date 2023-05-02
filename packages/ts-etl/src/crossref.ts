import { CrossrefClient, Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import type { ErrorOrDocmap } from './types'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from 'docmaps-sdk'

const Client = new CrossrefClient({
  BASE: 'https://api.crossref.org',
  // TODO is header a way to supply MAILTO for niceness?
  // HEADERS?: Headers
  // alternatively, create a wrapper class.
})

// Basic routine:
//    1. get the DOI specified
//    2. get any preprints referenced in its own relations
//    3. search for preprints
//    4. get reviews referenced in its own relations
//    5. search for reviews
//    6. recursively treat its preprints for reviews and further preprints

function decodeActionForWork(
  work: Work,
): E.Either<Error, D.DocmapActionT> {
    const errors: Error[] = []
    const workAuthors = work.author.map((a) => {
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

    const workObject = {
      // TODO: should we include arbitrary keys? make that parametric?
      // ...work,
      // FIXME: is this possibly fake news? should it fail instead if no published date?
      published: DatemorphISOString(work.published || work.created),
      doi: work.DOI,
      type: work.type,
      // TODO: other fields we ignore: id, content
    }

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
function stepArrayToDocmap(inputDoi: string, [firstStep, ...steps]: D.DocmapStepT[]): ErrorOrDocmap {
  // TODO: extract this
  const dm_id = `https://docmaps-project.github.io/ex/docmap_for/${inputDoi}`

  const now = new Date()

  let bnodeId = 0;

  let dmBody = {
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

  const reduction = steps.reduce<E.Either<Error, Record<string, D.DocmapStepT>>>((memo, next)=> {
    if (E.isLeft(memo)) {
      return memo //cascade all errors
    }

    let m = memo.right

    const previousId = `_:b${bnodeId}`
    bnodeId += 1
    const thisId = `_:b${bnodeId}`

    const prev = m[previousId]
    if (!prev) {
      return E.left(new Error(`algorithm error: step memo was missing step for id ${previousId} but was processing step with id ${thisId}`))
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
  }, E.right({
    '_:b0': firstStep,
  }))

  if (E.isLeft(reduction)) {
    return reduction
  }
  const dmObject = D.Docmap.decode({
    ...dmBody,
    'first-step': '_:b0',
    steps: reduction.right
  })

  if (E.isLeft(dmObject)) {
    return E.left(new Error('unable to parse manuscript step', { cause: dmObject.left }))
  }

  return E.right([dmObject.right])
}

async function fetchPublicationByDoi(
  client: CrossrefClient,
  inputDoi: string,
): Promise<ErrorOrDocmap> {
  const service = client.works
  const fetchManuscriptTask = TE.tryCatch(
    () => service.getWorks({ doi: inputDoi }),
    (reason: unknown) => new Error(String(reason)),
  )

  // the intermediate representation is input to this transform
  //   TODO: this may need to become an n3
  const toDocmap = (manuscript: Work, preprint: Work): ErrorOrDocmap => {
    const preprintAction = decodeActionForWork(preprint)

    if (E.isLeft(preprintAction)) {
      return E.left(new Error('unable to parse preprint action', { cause: preprintAction.left }))
    }

    const preprintStep = D.DocmapStep.decode({
      inputs: [],
      actions: [preprintAction.right],
      assertions: [
        {
          status: 'final-draft',
          item: preprint.DOI,
        },
      ],
    })

    if (E.isLeft(preprintStep)) {
      return E.left(new Error('unable to parse preprint step', { cause: preprintStep.left }))
    }

    // now, we have one complete Step for the preprint
    // we need a second step which describes the promotion to the Manuscript.
    // what STATUS is acquired? Published?

    const manuscriptAction = decodeActionForWork(manuscript)

    if (E.isLeft(manuscriptAction)) {
      return E.left(
        new Error('unable to parse manuscript action', { cause: manuscriptAction.left }),
      )
    }

    const manuscriptStep = D.DocmapStep.decode({
      // FIXME - this allowance of undefined is lazy
      inputs: [preprintStep.right.actions[0]?.outputs[0]],
      actions: [manuscriptAction.right],
      assertions: [
        {
          // TODO: this may be wrong. does "has preprint" mean "is published"?
          status: 'published',
          item: manuscript.DOI
        },
      ],
    })

    if (E.isLeft(manuscriptStep)) {
      return E.left(new Error('unable to parse manuscript step', { cause: manuscriptStep.left }))
    }

    // we have 2 steps. now we need to describe this whole workflow as one docmap.
    // TODO: input DOI may not be always correct if input was for preprint not manuscript
    return stepArrayToDocmap(inputDoi, [preprintStep.right, manuscriptStep.right])
  }

  const resultTask = pipe(
    fetchManuscriptTask,
    TE.map((response) => response.message),
    TE.chain((manuMessage) => () => {
      if (
        !manuMessage.relation ||
        !manuMessage.relation['has-preprint'] ||
        !manuMessage.relation['has-preprint'][0] ||
        !(manuMessage.relation['has-preprint'][0]['id-type'].toLowerCase() == 'doi')
      ) {
        return Promise.reject('Manuscript does not have preprint')
      }

      const preprintDoi = manuMessage.relation['has-preprint'][0].id

      return service.getWorks({ doi: preprintDoi }).then((prepMessage) => {
        return toDocmap(manuMessage, prepMessage.message)
      })
    }),
  )

  return await resultTask()
}

export { fetchPublicationByDoi, Client }
