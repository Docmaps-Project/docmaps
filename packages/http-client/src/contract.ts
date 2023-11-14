import { initContract } from '@ts-rest/core'
import { DocmapT } from 'docmaps-sdk'
import { ApiInfo, ErrorBody } from './types'

const c = initContract()

export const contract = c.router({
  getInfo: {
    method: 'GET',
    path: '/info',
    responses: {
      200: c.type<ApiInfo>(),
    },
    summary: 'Get information about this Docmaps API server',
  },

  getDocmapById: {
    method: 'GET',
    path: '/docmap/:id',
    // TODO: id as arg?
    responses: {
      200: c.type<DocmapT>(),
      404: c.type<ErrorBody>(),
    },
    summary: 'Get a docmap matching an IRI exactly',
  },

  getDocmapForDoi: {
    method: 'GET',
    path: '/docmap_for/doi',
    query: c.type<{ subject: string }>(),
    // TODO: id as arg?
    responses: {
      200: c.type<DocmapT>(),
      404: c.type<ErrorBody>(),
    },
    summary: 'Get a docmap that describes a research artifact with this DOI',
  },
})
