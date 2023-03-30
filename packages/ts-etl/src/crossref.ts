import type { CrossrefClient, WorksService } from 'crossref-openapi-client-ts';

interface PublicationData {
  preprint: object;
  manuscript: object;
}

async function fetchPublications(client: CrossrefClient, prefix: string, itemsPerPage: number = 2, page: number = 0): Promise<PublicationData[]> {
  const query = {
    'filter': `has-relation:1,prefix:${prefix}`,
    'rows': itemsPerPage,
    'offset': page * itemsPerPage,
  };

  const service = client.works;
  const response = await service.getWorks1(query);

  const preprints = response.message.items;

  const publicationDataPromises = preprints.map(async (preprint: any) => {
    const manuscriptId = preprint['relation']['is-preprint-of'].id;
    const manuscript = await service.getWorks({doi: manuscriptId});
    return {
      preprint,
      manuscript: manuscript.message,
    };
  });

  const publicationData = await Promise.all(publicationDataPromises);
  return publicationData;
}

export { fetchPublications };
