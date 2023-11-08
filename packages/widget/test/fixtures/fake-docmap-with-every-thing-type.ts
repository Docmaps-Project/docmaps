// This is a copy of elife-docmap-1.ts but with every supported display type in the last step

export default {
  "id": "https://example.com/synthetic-docmap-1",
  "type": "docmap",
  "created": "2022-11-28T11:30:05.000Z",
  "publisher": {
    "id": "https://example.com",
    "homepage": "https://example.com",
    "logo": "https://example.com/logo.png",
    "name": "example.com",
    "account": {
      "id": "https://example.com/groups/elife",
      "service": "https://example.com/"
    }
  },
  "first-step": "_:b7",
  "steps": {
    "_:b7": {
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "original-preprint-1"
          },
          "status": "manuscript-published"
        }
      ],
      "next-step": "_:b9",
      "actions": [
        {
          "outputs": [
            {
              "type": "preprint",
              "doi": "original-preprint-1",
              "published": "2022-11-22T00:00:00.000Z",
              "url": "https://www.biorxiv.org/content/original-preprint-1v2"
            }
          ],
          "participants": []
        }
      ],
      "inputs": []
    },
    "_:b9": {
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "elife-republication-of-preprint"
          },
          "status": "draft"
        },
        {
          "item": {
            "type": "preprint",
            "doi": "original-preprint-1"
          },
          "status": "under-review"
        }
      ],
      "next-step": "_:b16",
      "previous-step": "_:b7",
      "inputs": [
        {
          "type": "preprint",
          "doi": "original-preprint-1",
          "url": "https://www.biorxiv.org/content/original-preprint-1v2"
        }
      ],
      "actions": [
        {
          "outputs": [
            {
              "type": "preprint",
              "doi": "elife-republication-of-preprint"
            }
          ],
          "participants": []
        }
      ]
    },
    "_:b16": {
      "assertions": [
        {
          "item": {
            "type": "preprint",
            "doi": "original-preprint-1"
          },
          "status": "peer-reviewed"
        }
      ],
      "previous-step": "_:b9",
      "inputs": [
        {
          "type": "preprint",
          "doi": "elife-republication-of-preprint",
          "url": "https://example.com/elife-republication-of-preprint"
        }
      ],
      "actions": [
        {
          "participants": [
            {
              "actor": {
                "type": "person",
                "name": "Andrew Edstrom"
              },
              "role": "peer-reviewer"
            }
          ],
          "outputs": [
            {
              "type": "review",
              "doi": "fake-review-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-review-1"
            },
            {
              "type": "preprint",
              "doi": "fake-preprint-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-preprint-1"
            },
            {
              "type": "evaluation-summary",
              "doi": "fake-evaluation-summary-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-evaluation-summary-1"
            },
            {
              "type": "review-article",
              "doi": "fake-review-article-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-review-article-1"
            },
            {
              "type": "journal-article",
              "doi": "fake-journal-article-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-journal-article-1"
            },
            {
              "type": "editorial",
              "doi": "fake-editorial-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-editorial-1"
            },
            {
              "type": "comment",
              "doi": "fake-comment-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-comment-1"
            },
            {
              "type": "reply",
              "doi": "fake-reply-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/fake-reply-1"
            },
            {
              "doi": "has-no-type-1",
              "published": "2023-01-23T14:34:45.299Z",
              "url": "https://example.com/has-no-type-1"
            }
          ]
        }
      ]
    }
  },
  "@context": "https://w3id.org/docmaps/context.jsonld"
}