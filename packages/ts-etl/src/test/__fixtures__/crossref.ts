import { CrossrefClient, WorkMessage, WorksMessage, WorksService } from 'crossref-openapi-client-ts'
import { testCrossrefDate } from '../utils'
import { mock, instance, when } from 'ts-mockito'

export const crsT = mock(CrossrefClient)
export const crs = instance(crsT)
export const worksT = mock(WorksService)
export const w = instance(worksT)

when(crsT.works).thenReturn(w)

export const PREPRINT_DOI = '10.1234/preprint.1'
export const MANUSCRIPT_DOI = '10.1234/manuscript.1'

export const TEST_DATE = testCrossrefDate()

export const mockCrossrefWorksResponse: WorksMessage = {
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
export const mockCrossrefManuscriptResponse: WorkMessage = {
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
