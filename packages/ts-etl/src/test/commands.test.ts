import test from 'ava'
import { mock, instance, when, deepEqual } from 'ts-mockito'
import { CrossrefClient, WorksService } from 'crossref-openapi-client-ts'
import { PageCmd } from '../commands'
import util from 'util'

function test_date() {
  const now = new Date()
  return {
    'date-parts': [[now.getFullYear(), now.getMonth(), now.getDay()]],
    'date-time': now.toISOString(),
    timestamp: now.valueOf(),
  }
}

test('fetchPublications: happy-path scenario', async (t) => {
  const crsT = mock(CrossrefClient)
  const crs = instance(crsT)
  const worksT = mock(WorksService)
  const w = instance(worksT)

  when(crsT.works).thenReturn(w)

  const PREPRINT_DOI = '10.1234/preprint.1'
  const MANUSCRIPT_DOI = '10.1234/manuscript.1'

  const TEST_DATE = test_date()

  const mockResponse = {
    status: '',
    'message-type': 'work-list', // realistic strings
    'message-version': '1.0.0', // realistic strings
    message: {
      query: {
        'start-index': 0,
        'search-terms': 'mocked-value',
      },
      'total-results': 1000,
      'items-per-page': 1,
      items: [
        {
          relation: {
            'is-preprint-of': {
              id: '10.1234/manuscript.1',
              'id-type': 'DOI',
              'asserted-by': 'subject',
            },
          },
          URL: `https://doi.org/${PREPRINT_DOI}`,
          // unimportant values for this test
          DOI: PREPRINT_DOI,
          'reference-count': 0,
          'references-count': 0,
          'is-referenced-by-count': 0,
          title: ['Some work'],
          prefix: '10',
          source: 'mocks',
          author: [
            {
              family: 'ln',
              affiliation: [
                {
                  name: 'mocks',
                },
              ],
              sequence: 'mocks',
            },
          ],
          member: 'mocks',
          deposited: TEST_DATE,
          score: 0,
          issued: TEST_DATE,
          indexed: TEST_DATE,
          'content-domain': {
            domain: ['mocks'],
            'crossmark-restriction': false,
          },
          publisher: 'Test publisher',
          type: 'work',
          created: TEST_DATE,
        },
      ],
    },
  }
  const mockManuscript = {
    status: '',
    'message-type': 'work-list', // realistic strings
    'message-version': '1.0.0', // realistic strings
    message: {
      URL: `https://doi.org/${MANUSCRIPT_DOI}`,
      DOI: MANUSCRIPT_DOI,
      'reference-count': 0,
      'references-count': 0,
      'is-referenced-by-count': 0,
      title: ['Some work'],
      prefix: '10',
      source: 'mocks',
      author: [
        {
          family: 'ln',
          affiliation: [
            {
              name: 'mocks',
            },
          ],
          sequence: 'mocks',
        },
      ],
      member: 'mocks',
      deposited: TEST_DATE,
      score: 0,
      issued: TEST_DATE,
      indexed: TEST_DATE,
      'content-domain': {
        domain: ['mocks'],
        'crossmark-restriction': false,
      },
      publisher: 'Test publisher',
      type: 'work',
      created: TEST_DATE,
    },
  }

  //TODO extract this into a general API mock/map
  when(
    worksT.getWorks1(
      deepEqual({
        filter: `has-relation:1,prefix:10.1234`,
        rows: 1,
        offset: 0,
      }),
    ),
  ).thenResolve(mockResponse)

  when(worksT.getWorks(deepEqual({ doi: '10.1234/manuscript.1' }))).thenResolve(mockManuscript)

  const res = await PageCmd([], {
    source: 'crossref-api',
    client: crs,
    prefix: '10.1234',
    pageNumber: 0,
    rowsPerPage: 1,
  })

  const publications = JSON.parse(res)

  t.is(publications.length, 1)
  t.is(publications[0].preprint['URL'], 'https://doi.org/10.1234/preprint.1')
  t.is(publications[0].manuscript['URL'], 'https://doi.org/10.1234/manuscript.1')
  // console.log(util.inspect(publications, { depth: 4 }))
})
