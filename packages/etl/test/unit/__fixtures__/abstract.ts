import type { InductiveStepResult, Plugin } from '../../../src/types'
import { mock, instance } from 'ts-mockito'

import type * as D from 'docmaps-sdk'
import * as TE from 'fp-ts/lib/TaskEither'
import { MANUSCRIPT_DOI } from './crossref'

class AbstractPlugin implements Plugin<string> {
  stepForId(id: string): TE.TaskEither<Error, InductiveStepResult<string>> {
    // to allow variable names without change
    const _id = id
    return TE.left(new Error('must mock method or this will fail!'))
  }

  actionForReviewId(id: string): TE.TaskEither<Error, D.ActionT> {
    const _id = id
    return TE.left(new Error('must mock method or this will fail!'))
  }
}

export function AbstractPluginMocks() {
  const pluginT = mock(AbstractPlugin)
  const plugin = instance(pluginT)
  return {
    pluginT,
    plugin,
  }
}

export const PREPRINT_ID = 'preprint'
export const MANUSCRIPT_ID = 'manuscript'
export const REVIEW_1_ID = 'review_1'
export const REVIEW_2_ID = 'review_2'

export const PREPRINT_THING: D.ThingT = {
  type: 'preprint',
  id: PREPRINT_ID,
}

export const manuscriptStep: D.StepT = {
  actions: [
    {
      inputs: [],
      outputs: [
        {
          type: 'journal-article',
          id: MANUSCRIPT_ID,
        },
      ],
      participants: [
        {
          actor: {
            name: 'mock ln',
          },
          role: 'author',
        },
      ],
    },
  ],
  assertions: [
    {
      item: {
        type: 'journal-article',
        id: MANUSCRIPT_ID,
      },
      status: 'published',
    },
  ],
}

export const preprintStep: D.StepT = {
  actions: [
    {
      inputs: [],
      outputs: [
        {
          type: 'preprint',
          id: PREPRINT_ID,
        },
      ],
      participants: [
        {
          actor: {
            name: 'mock ln',
          },
          role: 'author',
        },
      ],
    },
  ],
  assertions: [
    {
      item: PREPRINT_THING,
      status: 'catalogued',
    },
  ],
}

export const reviewActions: D.ActionT[] = [
  {
    inputs: [{ doi: MANUSCRIPT_DOI }],
    outputs: [{ id: REVIEW_1_ID, type: 'review' }],
    participants: [],
  },
  {
    inputs: [{ doi: MANUSCRIPT_DOI }],
    outputs: [{ id: REVIEW_2_ID, type: 'review' }],
    participants: [],
  },
]

export const mockManuscriptWithPreprintResponse: InductiveStepResult<string> = {
  step: manuscriptStep,
  preprints: [PREPRINT_ID],
  reviews: [],
  manuscripts: [],
}

export const mockManuscriptWithReviewsResponse: InductiveStepResult<string> = {
  step: manuscriptStep,
  preprints: [],
  reviews: [REVIEW_1_ID, REVIEW_2_ID],
  manuscripts: [],
}

export const mockManuscriptResponse: InductiveStepResult<string> = {
  step: manuscriptStep,
  preprints: [],
  reviews: [],
  manuscripts: [],
}

export const mockPreprintWithManuscriptResponse: InductiveStepResult<string> = {
  step: preprintStep,
  preprints: [],
  reviews: [],
  manuscripts: [MANUSCRIPT_ID],
}
