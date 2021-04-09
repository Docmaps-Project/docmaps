var Ajv = require("ajv");
var docmap = require('./response.json');
var ajv = new Ajv();

var uriPattern = ".+://[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)";

var readJson = (path, cb) => {
    fs.readFile(require.resolve(path), (err, data) => {
      if (err)
        cb(err)
      else
        cb(null, JSON.parse(data))
    })
  }
  
var schema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "The root DocMap schema",
    "description": "The root schema comprises the entire docmap.",
    "default": {},
    "required": [
        "contentType",
        "content",
    ],
    "definitions": {
        "contributor": {
            "type": "object",
            "title": "The contributor schema",
            "description": "A contributor.",
            "default": {},
            "required": [
                "role"
            ],
            "properties": {
                "name": {
                    "$id": "#/definitions/contributor/name",
                    "type": "string",
                    "title": "The name schema",
                    "description": "The name of the contributor.",
                    "default": "",
                    "examples": [
                        ""
                    ]
                },
                "affiliations": {
                    "$id": "#/definitions/contributor/affiliations",
                    "type": "array",
                    "title": "The affiliations schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": [],
                    "examples": [
                        []
                    ],
                },
                "id": {
                    "$id": "#/definitions/contributor/id",
                    "type": "string",
                    "title": "The id schema",
                    "description": "An internal ID for the contributor, useful if the contributor is anonymous.",
                    "default": "",
                    "examples": [
                        ""
                    ]
                },
                "orcid": {
                    "$id": "#/definitions/contributor/orcid",
                    "type": "string",
                    "title": "The orcid schema",
                    "description": "The ORCID of the contributor.",
                    "default": "",
                    "examples": [
                        ""
                    ]
                },
                "role": {
                    "$id": "#/definitions/contributor/role",
                    "type": "string",
                    "enum": ["author", "reviewer", "editor"],
                    "title": "The role schema",
                    "description": "The role of the contributor.",
                    "default": "",
                    "examples": [
                        "editor"
                    ]
                }
            },
        }
    },
    "properties": {
        "contentType": {
            "$id": "#/properties/contentType",
            "type": "string",
            "enum": ["review", "author_response", "article"],
            "title": "The contentType schema",
            "description": "Describes the type of content.",
            "default": "",
            "examples": [
                "review"
            ]
        },
        "content": {
            "$id": "#/properties/content",
            "type": "string",
            "pattern": uriPattern,
            "title": "The content schema",
            "description": "A uri pointing to the most canonical version of the content.",
            "default": "",
            "examples": [
                "https://hyp.is/H7hTxl8mEeuJztfA9GxJ9A/www.biorxiv.org/content/10.1101/2020.12.15.422694v1"
            ]
        },
        "permalink": {
            "$id": "#/properties/permalink",
            "type": "string",
            "pattern": uriPattern,
            "title": "The permalink schema",
            "description": "A uri pointing to a description of the policy/process used.",
            "default": "",
            "examples": [
                "https://sciety.org/groups/b560187e-f2fb-4ff9-a861-a204f3fc0fb0"
            ]
        },
        "policy": {
            "$id": "#/properties/policy",
            "type": "string",
            "pattern": uriPattern,
            "title": "The policy schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "https://sciety.org/groups/b560187e-f2fb-4ff9-a861-a204f3fc0fb0"
            ]
        },
        "provider": {
            "$id": "#/properties/provider",
            "type": "string",
            "pattern": uriPattern,
            "title": "The provider schema",
            "description": "The root domain of the provider of the docmap",
            "default": "",
            "examples": [
                "https://sciety.org"
            ]
        },
        "asserter": {
            "$id": "#/properties/asserter",
            "type": "string",
            "title": "The asserter schema",
            "description": "The root domain of the asserter of the docmap.",
            "default": "",
            "examples": [
                "https://elife.org"
            ]
        },
        "assertedOn": {
            "$id": "#/properties/assertedOn",
            "type": "string",
            "title": "The assertedOn schema",
            "description": "The timestamp when the assertion itself was made.",
            "default": "",
            "examples": [
                "01-25-2021T10:58:00Z"
            ]
        },
        "createdOn": {
            "$id": "#/properties/createdOn",
            "type": "string",
            "title": "The createdOn schema",
            "description": "The timestamp when the object was created, e.g., when a review process began.",
            "default": "",
            "examples": [
                "01-25-2021T10:58:00Z"
            ]
        },
        "completedOn": {
            "$id": "#/properties/completedOn",
            "type": "string",
            "title": "The completedOn schema",
            "description": "The timestamp when the object was completed/published, e.g., when a paper was published, when a review was accepted.",
            "default": "",
            "examples": [
                "01-25-2021T10:58:00Z"
            ]
        },
        "doi": {
            "$id": "#/properties/doi",
            "type": "string",
            "pattern": "^10.\\d{4,9}/[-._;()/:A-Z0-9]+$",
            "title": "The doi schema",
            "description": "The doi of the object.",
            "default": "",
            "examples": [
                "10.1101/2020.12.15.422694"
            ],
        },
        "isReviewOf": {
            "$id": "#/properties/isReviewOf",
            "type": "array",
            "title": "The isReviewOf schema",
            "description": "A list of DocMaps or references to DocMaps that this DocMap is reviewing.",
            "default": [],
            "items": {
                "$ref": "#"
            },
        },
        "contributors": {
            "$id": "#/properties/contributors",
            "type": "array",
            "title": "The contributors schema",
            "description": "A list of contributors to this DocMap.",
            "default": [],
            "items": {
                "$ref": "#/definitions/contributor",
            }
        },
        "reviews": {
            "$id": "#/properties/reviews",
            "type": "array",
            "title": "The reviews schema",
            "description": "A list of DocMaps.",
            "default": [],
            "items": {
                "$ref": "#"
            }
        }
    }
}

var valid = ajv.validate(schema, docmap);
if(!valid) {
    console.log(ajv.errors);
    return;
}
console.log("valid!");
return;
