export default {
  id: 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101%2F2022.11.08.515698',
  type: 'docmap',
  created: '2022-11-28T11:30:05.000Z',
  publisher: {
    id: 'https://elifesciences.org/',
    homepage: 'https://elifesciences.org/',
    logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
    name: 'eLife',
    account: {
      id: 'https://sciety.org/groups/elife',
      service: 'https://sciety.org/',
    },
  },
  'first-step': '_:b7',
  steps: {
    '_:b7': {
      assertions: [
        {
          item: {
            type: 'preprint',
            doi: '10.1101/2022.11.08.515698',
          },
          status: 'manuscript-published',
        },
      ],
      'next-step': '_:b9',
      actions: [
        {
          outputs: [
            {
              type: 'preprint',
              doi: '10.1101/2022.11.08.515698',
              published: '2022-11-22T00:00:00.000Z',
              url: 'https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2',
            },
          ],
          participants: [],
        },
      ],
      inputs: [],
    },
    '_:b9': {
      assertions: [
        {
          item: {
            type: 'preprint',
            doi: '10.7554/eLife.85111.1',
          },
          status: 'draft',
        },
        {
          item: {
            type: 'preprint',
            doi: '10.1101/2022.11.08.515698',
          },
          status: 'under-review',
        },
      ],
      'next-step': '_:b16',
      'previous-step': '_:b7',
      inputs: [
        {
          type: 'preprint',
          doi: '10.1101/2022.11.08.515698',
          url: 'https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2',
        },
      ],
      actions: [
        {
          outputs: [
            {
              type: 'preprint',
              doi: '10.7554/eLife.85111.1',
            },
          ],
          participants: [],
        },
      ],
    },
    '_:b16': {
      assertions: [
        {
          item: {
            type: 'preprint',
            doi: '10.1101/2022.11.08.515698',
          },
          status: 'peer-reviewed',
        },
      ],
      'previous-step': '_:b9',
      inputs: [
        {
          type: 'preprint',
          doi: '10.1101/2022.11.08.515698',
          url: 'https://www.biorxiv.org/content/10.1101/2022.11.08.515698v2',
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
              doi: '10.7554/eLife.85111.1.sa2',
              published: '2023-01-23T14:34:43.676Z',
              content: [
                {
                  type: 'web-page',
                  url: 'https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:E9MOvpsrEe2w6nds1t6xxQ',
                },
                {
                  type: 'web-page',
                  url: 'https://hypothes.is/a/E9MOvpsrEe2w6nds1t6xxQ',
                },
                {
                  type: 'web-page',
                  url: 'https://sciety.org/evaluations/hypothesis:E9MOvpsrEe2w6nds1t6xxQ/content',
                },
              ],
              url: 'https://doi.org/10.7554/eLife.85111.1.sa2',
            },
          ],
        },
        {
          outputs: [
            {
              type: 'reply',
              doi: '10.7554/eLife.85111.1.sa1',
              published: '2023-01-23T14:34:42.571Z',
              content: [
                {
                  type: 'web-page',
                  url: 'https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:EzFzxJsrEe28DyfQK4aPhg',
                },
                {
                  type: 'web-page',
                  url: 'https://hypothes.is/a/EzFzxJsrEe28DyfQK4aPhg',
                },
                {
                  type: 'web-page',
                  url: 'https://sciety.org/evaluations/hypothesis:EzFzxJsrEe28DyfQK4aPhg/content',
                },
              ],
              url: 'https://doi.org/10.7554/eLife.85111.1.sa1',
            },
          ],
          participants: [],
        },
        {
          participants: [
            {
              actor: {
                type: 'person',
                name: 'Brice Bathellier',
              },
              role: 'editor',
            },
            {
              actor: {
                type: 'person',
                name: 'Kate Wassum',
              },
              role: 'senior-editor',
            },
          ],
          outputs: [
            {
              type: 'evaluation-summary',
              doi: '10.7554/eLife.85111.1.sa4',
              published: '2023-01-23T14:34:45.299Z',
              content: [
                {
                  type: 'web-page',
                  url: 'https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:FMwbnpsrEe2mVPtbQf2X2w',
                },
                {
                  type: 'web-page',
                  url: 'https://hypothes.is/a/FMwbnpsrEe2mVPtbQf2X2w',
                },
                {
                  type: 'web-page',
                  url: 'https://sciety.org/evaluations/hypothesis:FMwbnpsrEe2mVPtbQf2X2w/content',
                },
              ],
              url: 'https://doi.org/10.7554/eLife.85111.1.sa4',
            },
          ],
        },
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
              doi: '10.7554/eLife.85111.1.sa3',
              published: '2023-01-23T14:34:44.369Z',
              content: [
                {
                  type: 'web-page',
                  url: 'https://sciety.org/evaluations/hypothesis:FD5EmpsrEe28RaOWOszMEw/content',
                },
                {
                  type: 'web-page',
                  url: 'https://sciety.org/articles/activity/10.1101/2022.11.08.515698#hypothesis:FD5EmpsrEe28RaOWOszMEw',
                },
                {
                  type: 'web-page',
                  url: 'https://hypothes.is/a/FD5EmpsrEe28RaOWOszMEw',
                },
              ],
              url: 'https://doi.org/10.7554/eLife.85111.1.sa3',
            },
          ],
        },
      ],
    },
  },
  '@context': 'https://w3id.org/docmaps/context.jsonld',
}
