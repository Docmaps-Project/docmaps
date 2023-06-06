import { CrossrefClient, WorkMessage, WorksMessage, WorksService } from 'crossref-openapi-client-ts'
import { testCrossrefDate } from '../utils'
import { mock, instance, when } from 'ts-mockito'

export function CrossrefClientMocks() {
  const crsT = mock(CrossrefClient)
  const crs = instance(crsT)
  const worksT = mock(WorksService)
  const w = instance(worksT)

  when(crsT.works).thenReturn(w)

  return {
    crs: crs,
    crsT: crsT,
    w: w,
    worksT: worksT,
  }
}

export const PREPRINT_DOI = '10.1234/preprint.1'
export const MANUSCRIPT_DOI = '10.1234/manuscript.1'
export const REVIEW_1_DOI = '10.1234/review.1'
export const REVIEW_2_DOI = '10.1234/review.2'

export const TEST_DATE = testCrossrefDate()

export const GENERIC_WORK_DATA = {
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
  created: TEST_DATE,
  prefix: '10',
}

const PreprintItemBody = {
  ...GENERIC_WORK_DATA,
  relation: {
    'is-preprint-of': [
      {
        id: MANUSCRIPT_DOI,
        'id-type': 'DOI',
        'asserted-by': 'subject',
      },
    ],
  },
  type: 'posted-content',
  URL: `https://doi.org/${PREPRINT_DOI}`,
  // unimportant values for this test
  DOI: PREPRINT_DOI,
  prefix: '10',
}

export const mockCrossrefPreprintResponse: WorkMessage = {
  status: 'ok',
  'message-type': 'work', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: PreprintItemBody,
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
    items: [PreprintItemBody],
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
    type: 'journal-article',
    relation: {},
  },
}

export const mockCrossrefManuscriptWithPreprintResponse: WorkMessage = {
  status: 'ok',
  'message-type': 'work', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: {
    ...GENERIC_WORK_DATA,
    URL: `https://doi.org/${MANUSCRIPT_DOI}`,
    DOI: MANUSCRIPT_DOI,
    type: 'journal-article',
    relation: {
      'has-preprint': [
        {
          id: PREPRINT_DOI,
          'id-type': 'doi',
          'asserted-by': 'subject',
        },
      ],
    },
  },
}

export const mockCrossrefManuscriptWithReviewsResponse: WorkMessage = {
  status: 'ok',
  'message-type': 'work', // realistic strings
  'message-version': '1.0.0', // realistic strings
  message: {
    ...GENERIC_WORK_DATA,
    URL: `https://doi.org/${MANUSCRIPT_DOI}`,
    DOI: MANUSCRIPT_DOI,
    type: 'journal-article',
    relation: {
      'has-review': [
        {
          id: REVIEW_1_DOI,
          'id-type': 'doi',
          'asserted-by': 'object',
        },
        {
          id: REVIEW_2_DOI,
          'id-type': 'doi',
          'asserted-by': 'object',
        },
      ],
    },
  },
}

export const mockCrossrefReviewsResponses: WorkMessage[] = [REVIEW_1_DOI, REVIEW_2_DOI].map(
  (doi) => ({
    status: 'ok',
    'message-type': 'work', // realistic strings
    'message-version': '1.0.0', // realistic strings
    message: {
      ...GENERIC_WORK_DATA,
      URL: `https://doi.org/${doi}`,
      DOI: doi,
      type: 'peer-review',
      relation: {
        'is-review-of': [
          {
            'id-type': 'doi',
            id: 'mocked-value',
            'asserted-by': 'subject',
          },
        ],
      },
    },
  }),
)

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
        DOI: REVIEW_1_DOI,
        URL: `http://dx.doi.org/{REVIEW_1_DOI}`,
        type: 'peer-review',
        relation: {
          'is-review-of': [
            {
              'id-type': 'doi',
              id: 'mocked-value',
              'asserted-by': 'subject',
            },
          ],
        },
      },
      {
        ...GENERIC_WORK_DATA,
        DOI: REVIEW_2_DOI,
        URL: `http://dx.doi.org/{REVIEW_2_DOI}`,
        type: 'peer-review',
        relation: {
          'is-review-of': [
            {
              'id-type': 'doi',
              id: 'mocked-value',
              'asserted-by': 'subject',
            },
          ],
        },
      },
    ],
  },
}
