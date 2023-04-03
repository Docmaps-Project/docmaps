import test from 'ava'
import { PageCmd } from '../commands'
import { whenThenResolve } from './utils'
import * as cm from './__fixtures__/crossref'

test('fetchPublications: happy-path scenario', async (t) => {
  whenThenResolve(
    cm.worksT.getWorks1,
    { filter: `has-relation:1,prefix:10.1234`, rows: 1, offset: 0 },
    cm.mockCrossrefWorksResponse,
  )
  whenThenResolve(
    cm.worksT.getWorks,
    { doi: '10.1234/manuscript.1' },
    cm.mockCrossrefManuscriptResponse,
  )

  const res = await PageCmd([], {
    source: 'crossref-api',
    client: cm.crs,
    prefix: '10.1234',
    pageNumber: 0,
    rowsPerPage: 1,
  })

  const publications = JSON.parse(res)

  t.is(publications.length, 1)
  t.is(publications[0].preprint['URL'], 'https://doi.org/10.1234/preprint.1')
  t.is(publications[0].manuscript['URL'], 'https://doi.org/10.1234/manuscript.1')
})