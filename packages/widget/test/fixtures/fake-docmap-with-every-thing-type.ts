// This is a copy of docmapWithMultipleSteps.ts but with every supported display type in the last step

export default {
    "@context": "https://w3id.org/docmaps/context.jsonld",
    "type": "docmap",
    "id": "https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/get-by-doi?preprint_doi=10.1101%2F2022.11.08.000001",
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
            "participants": [],
            "outputs": [
              {
                "type": "preprint",
                "doi": "10.1101/2022.11.08.000001",
                "url": "https://www.biorxiv.org/content/10.1101/2022.11.08.000001v2",
                "published": "2022-11-22",
                "versionIdentifier": "2"
              }
            ]
          }
        ],
        "assertions": [
          {
            "item": {
              "type": "preprint",
              "doi": "10.1101/2022.11.08.000001",
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
                "type": "preprint",
                "doi": "10.7554/eLife.00001"
              }
            ]
          }
        ],
        "assertions": [
          {
            "item": {
              "type": "preprint",
              "doi": "10.1101/2022.11.08.000001",
              "versionIdentifier": "2"
            },
            "status": "under-review",
            "happened": "2022-11-28T11:30:05+00:00"
          },
          {
            "item": {
              "type": "preprint",
              "doi": "10.7554/eLife.00001",
              "versionIdentifier": ""
            },
            "status": "draft"
          }
        ],
        "inputs": [
          {
            "type": "preprint",
            "doi": "10.1101/2022.11.08.000001",
            "url": "https://www.biorxiv.org/content/10.1101/2022.11.08.000001v2",
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
                "published": "2023-01-23T14:34:44.369019+00:00",
                "content": [
                  {
                    "type": "web-page",
                    "url": "https://hypothes.is/a/FD5EmpsrEe28RaOWOszMEw"
                  },
                  {
                    "type": "web-page",
                    "url": "https://sciety.org/articles/activity/10.1101/2022.11.08.000001#hypothesis:FD5EmpsrEe28RaOWOszMEw"
                  },
                  {
                    "type": "web-page",
                    "url": "https://sciety.org/evaluations/hypothesis:FD5EmpsrEe28RaOWOszMEw/content"
                  }
                ]
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
                "url": "https://example.com/fake-journal/article/3003"
              },
              {
                "type": "review",
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake/review/3003"
              },
              {
                "type": "reply",
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake/reply/3003"
              },
              {
                "type": "comment",
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake/comment/3003"
              },
              {
                "type": "editorial",
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake/editorial/3003"
              },
              {
                "type": "evaluation-summary",
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake-evaluation/summary/3003"
              },
              {
                "published": "2023-01-23T14:34:45.299Z",
                "url": "https://example.com/fake/review/3003"
              }

            ]
          }
        ],
        "assertions": [
          {
            "item": {
              "type": "preprint",
              "doi": "10.1101/2022.11.08.000001",
              "versionIdentifier": "2"
            },
            "status": "peer-reviewed"
          }
        ],
        "inputs": [
          {
            "type": "preprint",
            "doi": "10.7554/eLife.00001"
          }
        ],
        "previous-step": "_:b1"
      }
    }
  }
