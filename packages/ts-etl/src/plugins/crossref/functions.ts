import { Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from 'docmaps-sdk'
import { mapLeftToUnknownError, nameForAuthor } from '../../utils'
import { eqString } from 'fp-ts/lib/Eq'

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
        E.traverseArray((a) =>
          pipe(a, D.Actor.decode, mapLeftToUnknownError('decoding actor in decodeActionForWork')),
        ),
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
        mapLeftToUnknownError('decoding action in decodeActionForWork'),
      ),
    ),
  )
}

export function relatedDoisForWork(w: Work, relation: string): string[] {
  const reviews = w.relation?.[relation]
  if (!reviews) {
    return []
  }

  return pipe(
    reviews,
    // get unique IDs
    A.map((wre) => wre.id),
    A.uniq(eqString),
  )
}
