// This is a copy of elife-docmap-1.ts but with every supported display type in the last step

export default {
  "@context": "https://w3id.org/docmaps/context.jsonld",
  "type": "docmap",
  "id": "https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.000002",
  "created": "2022-11-28T11:30:05+00:00",
  "updated": "2022-11-28T11:30:05+00:00",
  "publisher": {
    "account": {
      "id": "https://sciety.org/groups/elife",
      "service": "https://sciety.org"
    },
    "homepage": "https://elifesciences.org/",
    "id": "https://elifesciences.org/",
    "logo": "https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png",
    "name": "eLife"
  },
  "first-step": "_:b0",
  "steps": {
    "_:b0": {
      "actions": [
        {
          "participants": [
            {
              "actor": {
                "name": "eve",
                "type": "person"
              },
              "role": "spaceship-builder"
            },
            {
              "actor": {
                "name": "Andrew Edstrom",
                "type": "person"
              },
              "role": "gun-for-hire"
            }
          ],
          "outputs": [
            {
              "type": "preprint",
              "doi": "10.1101/2022.11.08.000002",
              "id": "sick-preprint-bro",
              "url": "https://example.com/sick-preprint-yo",
              "published": "1993-10-20",
              "versionIdentifier": "2",
              "content": [
                {
                  "type": "web-page",
                  "url": "https://example.com/fake-journal/article/3003.png"
                },
                {
                  "type": "web-page",
                  "url": "https://example.com/fake-journal/article/3003.heic"
                }
              ]
            }
          ]
        }
      ],
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "10.1101/2022.11.08.000002",
            "versionIdentifier": "2"
          },
          "status": "manuscript-published"
        }
      ],
      "inputs": [],
      "next-step": "_:b1"
    },
    "_:b1": {
      "actions": [
        {
          "participants": [],
          "outputs": [
            {
              "identifier": "85111",
              "versionIdentifier": "",
              "type": "review-article",
              "doi": "10.7554/eLife.00002"
            }
          ]
        }
      ],
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "10.1101/2022.11.08.000002",
            "versionIdentifier": "2"
          },
          "status": "under-review",
          "happened": "2022-11-28T11:30:05+00:00"
        }
      ],
      "inputs": [
        {
          "type": "preprint",
          "doi": "10.1101/2022.11.08.000002",
          "url": "https://example.com/sick-preprint-yo",
          "versionIdentifier": "2"
        }
      ],
      "next-step": "_:b2",
      "previous-step": "_:b0"
    },
    "_:b2": {
      "actions": [
        {
          "participants": [
            {
              "actor": {
                "name": "anonymous",
                "type": "person"
              },
              "role": "peer-reviewer"
            }
          ],
          "outputs": [
            {
              "type": "review-article",
              "published": "2023-01-23T14:34:43.676466+00:00",
              "content": [
                {
                  "type": "web-page",
                  "url": "https://hypothes.is/a/E9MOvpsrEe2w6nds1t6xxQ"
                },
                {
                  "type": "web-page",
                  "url": "https://sciety.org/articles/activity/10.1101/2022.11.08.000002#hypothesis:E9MOvpsrEe2w6nds1t6xxQ"
                },
                {
                  "type": "web-page",
                  "url": "https://sciety.org/evaluations/hypothesis:E9MOvpsrEe2w6nds1t6xxQ/content"
                }
              ]
            }
          ]
        },
        {
          "participants": [
            {
              "actor": {
                "name": "anonymous",
                "type": "person"
              },
              "role": "peer-reviewer"
            }
          ],
          "outputs": [
            {
              "type": "review-article",
              "published": "2023-01-23T14:34:44.369019+00:00"
            }
          ]
        },
        {
          "participants": [
            {
              "actor": {
                "name": "Andrew Edstrom",
                "type": "person"
              },
              "role": "editor"
            }
          ],
          "outputs": [
            {
              "type": "journal-article",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-journal/article/3003",
              "content": [
                {
                  "type": "web-page",
                  "url": "https://example.com/fake-journal/article/3003.mp4"
                },
                {
                  "type": "web-page",
                  "url": "https://example.com/fake-journal/article/3003.pdf"
                },
                {
                  "type": "web-page",
                  "url": "https://example.com/fake-journal/article/3003.xml"
                }
              ]
            }
          ]
        }
      ],
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "10.1101/2022.11.08.000002",
            "versionIdentifier": "2"
          },
          "status": "peer-reviewed"
        }
      ],
      "inputs": [
        {
          "type": "review-article",
          "doi": "10.7554/eLife.00002"
        }
      ],
      "previous-step": "_:b1"
    }
  }
}
