import type { CrossrefClient, Work } from 'crossref-openapi-client-ts'

interface PublicationData {
  preprint: object
  manuscript: object
}

async function fetchPublications(
  client: CrossrefClient,
  prefix: string,
  itemsPerPage = 2,
  page = 0,
): Promise<PublicationData[]> {
  const query = {
    filter: `has-relation:1,prefix:${prefix}`,
    rows: itemsPerPage,
    offset: page * itemsPerPage,
  }

  const service = client.works
  const response = await service.getWorks1(query)

  const preprints = response.message.items

  const publicationDataPromises = preprints.map(async (preprint: Work) => {
    const relations = preprint['relation']
    if (!relations) {
      throw new Error('no relations found for preprint', { cause: preprint })
    }

    const manuscriptData = relations['is-preprint-of']
    if (!manuscriptData || manuscriptData['id-type'] != 'DOI') {
      throw new Error('no manuscript with DOI present in is-preprint-of', { cause: relations })
    }

    const manuscript = await service.getWorks({ doi: manuscriptData.id })
    return {
      preprint,
      manuscript: manuscript.message,
    }
  })

  const publicationData = await Promise.all(publicationDataPromises)
  return publicationData
}

export { fetchPublications }
