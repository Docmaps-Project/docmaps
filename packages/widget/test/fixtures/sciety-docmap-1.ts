export default {
  id: 'https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-1043992/v1/biophysics-colab.docmap.json',
  type: 'docmap',
  created: '2022-04-19T11:40:09.289Z',
  publisher: {
    id: 'https://biophysics.sciencecolab.org',
    homepage: 'https://biophysics.sciencecolab.org/',
    logo: 'https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png',
    name: 'Biophysics Colab',
    account: {
      id: 'https://sciety.org/groups/biophysics-colab',
      service: 'https://sciety.org/',
    },
  },
  'first-step': '_:b1',
  steps: {
    '_:b1': {
      inputs: [
        {
          doi: '10.21203/rs.3.rs-1043992/v1',
          url: 'https://doi.org/10.21203/rs.3.rs-1043992/v1',
        },
      ],
      actions: [
        {
          participants: [
            {
              actor: {
                type: 'person',
                name: 'anonymous',
              },
              role: 'peer-reviewer',
            },
          ],
          outputs: [
            {
              type: 'review-article',
              published: '2022-04-19T11:35:26.469Z',
              content: [
                {
                  type: 'web-page',
                  url: 'https://sciety.org/articles/activity/10.21203/rs.3.rs-1043992/v1#hypothesis:ztQE-L_UEey5hB8TupDhxw',
                },
                {
                  type: 'web-page',
                  url: 'https://hypothes.is/a/ztQE-L_UEey5hB8TupDhxw',
                },
                {
                  type: 'web-content',
                  url: 'https://sciety.org/evaluations/hypothesis:ztQE-L_UEey5hB8TupDhxw/content',
                },
              ],
            },
          ],
        },
      ],
      assertions: [],
    },
  },
  '@context': 'https://w3id.org/docmaps/context.jsonld',
}
