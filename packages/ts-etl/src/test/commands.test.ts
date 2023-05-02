import test from 'ava'
import { isLeft } from 'fp-ts/lib/Either'
import { ItemCmd } from '../commands'
import { whenThenResolve } from './utils'
import * as cm from './__fixtures__/crossref'

// TODO: decouple commands test from crossref test

test('ItemCmd: crossref: happy-path scenario: a manuscript with one preprint and no reviews', async (t) => {
  // Only current routine:
  //    1. get the DOI specified
  //    2. get any preprints referenced in its own relations
  //    3. search for preprints
  //    4. get reviews referenced in its own relations
  //    5. search for reviews
  //    6. recursively treat its preprints for reviews and further preprints

  const mocks = cm.CrossrefClientMocks()
  whenThenResolve(mocks.worksT.getWorks, { doi: cm.MANUSCRIPT_DOI }, cm.mockCrossrefManuscriptWithPreprintResponse)
  whenThenResolve(mocks.worksT.getWorks, { doi: cm.PREPRINT_DOI }, cm.mockCrossrefPreprintResponse)

  const res = await ItemCmd([cm.MANUSCRIPT_DOI], {
    source: {
      preset: 'crossref-api',
      client: mocks.crs,
    },
  })

  if (isLeft(res)) {
    t.fail(`Got error instead of docmaps: ${res.left}`)
    return
  }

  t.is(res.right.length, 1)
  const dm = res.right[0]

  // necessary because Typescript doesn't narrow down type of dm just because
  // test failure guarantees we can't get here
  if (!dm) {
    t.fail('impossibly, we couldnt find the first docmap in a list of one')
    return //necessary
  }

  t.deepEqual(dm.type, 'docmap')
  t.is(dm.steps ? Object.keys(dm.steps).length : 0, 2)
  t.is(dm.steps?.['_:b0']?.inputs.length, 0)
  t.deepEqual(dm.steps?.['_:b0']?.actions[0]?.outputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(dm.steps?.['_:b1']?.inputs[0]?.doi, cm.PREPRINT_DOI)
  t.deepEqual(dm.steps?.['_:b1']?.actions[0]?.outputs[0]?.doi, cm.MANUSCRIPT_DOI)
  //TODO: can write stronger assertions as we learn what this should look like
})
