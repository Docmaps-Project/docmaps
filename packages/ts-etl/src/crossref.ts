import { CrossrefClient, Work, DatemorphISOString } from 'crossref-openapi-client-ts'
import * as E from 'fp-ts/lib/Either'
import type {ErrorOrDocmap} from './types'
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as D from 'docmaps-sdk';

const Client = new CrossrefClient({
  BASE: 'https://api.crossref.org',
});

  // Basic routine:
  //    1. get the DOI specified
  //    2. get any preprints referenced in its own relations
  //    3. search for preprints
  //    4. get reviews referenced in its own relations
  //    5. search for reviews
  //    6. recursively treat its preprints for reviews and further preprints

async function fetchPublicationByDoi(
  client: CrossrefClient,
  inputDoi: string
): Promise<ErrorOrDocmap> {
  const service = client.works;
  const fetchManuscriptTask = TE.tryCatch(
    () => service.getWorks({ doi: inputDoi }),
    (reason: unknown) => new Error(String(reason)),
  );

  // the intermediate representation is input to this transform
  //   TODO: this may need to become an n3
  const toDocmap = (
    manuscript: Work,
    preprint: Work,
  ): ErrorOrDocmap => {

    const errors: Error[] = [];
    const preprintAuthors = preprint.author.map((a)=>{
      // TODO this whole code block shows why better use of fp-ts chaining is needed
      const auth = D.DocmapActor.decode({
        type: 'person',
        name: a.name || `${a.family}, ${a.given}` || "" // FIXME this seems presumptuous
      })
      if (E.isLeft(auth)) {
        errors.push(new Error("unable to parse preprint author", {cause: auth.left}));
        return // undefined behavior because exits later
      }

      return ({
        actor: auth.right,
        role: 'author',
      });
    })

    if (errors.length > 0) {
      return E.left(new Error("unable to parse preprint authors", {cause: errors}))
    }


    const preprintObject = {
      // FIXME: is this possibly fake news? should it fail instead if no published date?
      ...preprint,
      published: DatemorphISOString(preprint.published || preprint.created),
      doi: preprint.DOI,
      type: preprint.type,
      // TODO: other fields we ignore: id, content
    }

    const preprintAction = D.DocmapAction.decode({
        participants: preprintAuthors,
        outputs: [preprintObject],
    })

    if (E.isLeft(preprintAction)) {
      return E.left(new Error("unable to parse preprint action", {cause: preprintAction.left}));
    }

    const preprintStep = D.DocmapStep.decode({
      inputs: [preprintObject],
      actions: [preprintAction.right],
      assertions: [{
        status: 'final-draft',
        // TODO: this is too strong an assumption (how to identify the item?)
        item: preprintObject.doi || preprintObject
      }],
    })

    if (E.isLeft(preprintStep)) {
      console.log(preprintStep.left)
      return E.left(new Error("unable to parse preprint step", {cause: preprintStep.left}));
    }

    // now, we have one complete Step for the preprint
    // we need a second step which describes the promotion to the Manuscript.
    // what STATUS is acquired? Published?


    const manuscriptObject = D.DocmapThing.decode({
      // FIXME: is this possibly fake news? should it fail instead if no published date?
      ...manuscript,
      published: DatemorphISOString(manuscript.published || manuscript.created),
      doi: manuscript.DOI,
      type: manuscript.type,
      // other fields we ignore: id, content
    })

    if (E.isLeft(manuscriptObject)) {
      return E.left(new Error("unable to parse manuscript object", {cause: manuscriptObject.left}));
    }

    const manuscriptAuthors = manuscript.author.map((a)=>{
      // TODO this whole code block shows why better use of fp-ts chaining is needed
      const auth = D.DocmapActor.decode({
        type: 'person',
        name: a.name || `${a.family}, ${a.given}` || "" // FIXME this seems presumptuous
      })
      if (E.isLeft(auth)) {
        errors.push(new Error("unable to parse manuscript author", {cause: auth.left}));
        return // undefined behavior because exits later
      }

      return ({
        actor: auth.right,
        role: 'author',
      });
    })

    if (errors.length > 0) {
      return E.left(new Error("unable to parse manuscript authors", {cause: errors}))
    }

    const manuscriptAction = D.DocmapAction.decode({
        participants: manuscriptAuthors,
        outputs: [manuscriptObject.right],
    })

    if (E.isLeft(manuscriptAction)) {
      return E.left(new Error("unable to parse manuscript action", {cause: manuscriptAction.left}));
    }

    const manuscriptStep = D.DocmapStep.decode({
      inputs: [manuscriptObject.right],
      actions: [manuscriptAction.right],
      assertions: [{
        // TODO: this may be wrong. does "has preprint" mean "is published"?
        status: 'published',
        // TODO: this is too strong an assumption (how to identify the item?)
        item: manuscriptObject.right.doi || manuscriptObject.right.id || manuscriptObject.right
      }],
    })

    if (E.isLeft(manuscriptStep)) {
      return E.left(new Error("unable to parse manuscript step", {cause: manuscriptStep.left}));
    }

    // we have 2 steps. now we need to describe this whole workflow as one docmap.

    // TODO: extract this
    const dm_id = `https://docmaps-project.github.io/ex/docmap_for/${inputDoi}`

    const now = new Date()

    const dmObject = D.Docmap.decode(
      { type: 'docmap',
        id: dm_id,
        publisher: {
          // TODO: fill this in
        },
        created: now, // FIXME does it have to be a string?
        updated: now, // FIXME does it have to be a string?
        'first-step': '_:b0',
        steps: {
          '_:b0': {
            ...preprintStep.right,
            'next-step': '_:b1',
          },
          '_:b1': {
            ...manuscriptStep.right,
            'previous-step': '_:b0',
          }
        }
      }
    )

    if (E.isLeft(dmObject)) {
      return E.left(new Error("unable to parse manuscript step", {cause: dmObject.left}));
    }

    return E.right([dmObject.right])
  };

  const resultTask = pipe(
    fetchManuscriptTask,
    TE.map(response => response.message),
    TE.chain(manuMessage => () => {
      if (
        !manuMessage.relation
        || !manuMessage.relation['has-preprint']
        || !manuMessage.relation['has-preprint'][0]
        || !(manuMessage.relation['has-preprint'][0]['id-type'] == 'DOI')
      ) {
        return Promise.reject('Manuscript does not have preprint')
      }

      const preprintDoi = manuMessage.relation['has-preprint'][0].id

      return service.getWorks({doi: preprintDoi}).then(prepMessage => {
        return toDocmap(
          prepMessage.message,
          manuMessage,
        );
      });
    })
  );

  return await resultTask();
}


export { fetchPublicationByDoi, Client };
