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

const GENERIC_WORK_DATA = {
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
  title: ['Some work'],
  'reference-count': 0,
  'references-count': 0,
  'is-referenced-by-count': 0,
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
  prefix: '10',
}

const PreprintItemBody = {
  ...GENERIC_WORK_DATA,
  relation: {
    'is-preprint-of': [{
      id: '10.1234/manuscript.1',
      'id-type': 'DOI',
      'asserted-by': 'subject',
    }],
  },
  URL: `https://doi.org/${PREPRINT_DOI}`,
  // unimportant values for this test
  DOI: PREPRINT_DOI,
  prefix: '10',
}

export const mockCrossrefPreprintResponse: WorkMessage = {
  status: 'ok',
  'message-type': 'work', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: PreprintItemBody
}

export const mockCrossrefWorksResponse: WorksMessage = {
  status: 'ok',
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
      PreprintItemBody
    ],
  },
}
export const mockCrossrefManuscriptResponse: WorkMessage = {
  status: 'ok',
  'message-type': 'work', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: {
    ...GENERIC_WORK_DATA,
    URL: `https://doi.org/${MANUSCRIPT_DOI}`,
    DOI: MANUSCRIPT_DOI,
    relation: {
      'has-preprint': [{
        id: '10.1234/preprint.1',
        'id-type': 'DOI',
        'asserted-by': 'subject',
      }],
    },
  },
}

export const mockCrossrefReviewsResponse: WorksMessage = {
  status: 'ok',
  'message-type': 'work-list', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: {
    query: {
      'start-index': 0,
      'search-terms': 'mocked-value',
    },
    'total-results': 1000,
    'items-per-page': 2,
    items: [
      {
        ...GENERIC_WORK_DATA,
        DOI: "10.1234/review.1",
        URL: "http://dx.doi.org/10.1234/review.1",
        relation: {
          "is-review-of": [
            {
              "id-type": "doi",
              "id": "10.1186/1471-2334-10-89",
              "asserted-by": "subject"
            }
          ]
        },
      },
      {
        ...GENERIC_WORK_DATA,
        DOI: "10.1234/review.2",
        URL: "http://dx.doi.org/10.1234/review.2",
        relation: {
          "is-review-of": [
            {
              "id-type": "doi",
              "id": "10.1098/RSOB.210168",
              "asserted-by": "subject"
            }
          ]
        },
      }
    ],
  },
}
