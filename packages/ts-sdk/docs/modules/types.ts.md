---
title: types.ts
nav_order: 1
parent: Modules
---

## types overview

Library of Docmaps encoders and types.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Docmap](#docmap)
  - [DocmapAction](#docmapaction)
  - [DocmapActionT (type alias)](#docmapactiont-type-alias)
  - [DocmapActor](#docmapactor)
  - [DocmapActorT (type alias)](#docmapactort-type-alias)
  - [DocmapManifestation](#docmapmanifestation)
  - [DocmapManifestationT (type alias)](#docmapmanifestationt-type-alias)
  - [DocmapOnlineAccount](#docmaponlineaccount)
  - [DocmapOnlineAccountT (type alias)](#docmaponlineaccountt-type-alias)
  - [DocmapPublisher](#docmappublisher)
  - [DocmapPublisherT (type alias)](#docmappublishert-type-alias)
  - [DocmapRoleInTime](#docmaproleintime)
  - [DocmapRoleInTimeT (type alias)](#docmaproleintimet-type-alias)
  - [DocmapStep](#docmapstep)
  - [DocmapStepT (type alias)](#docmapstept-type-alias)
  - [DocmapT (type alias)](#docmapt-type-alias)
  - [DocmapThing](#docmapthing)
  - [DocmapThingT (type alias)](#docmapthingt-type-alias)
  - [DocmapsFactory](#docmapsfactory)
  - [IRI (type alias)](#iri-type-alias)

---

# utils

## Docmap

**Signature**

```ts
export declare const Docmap: t.IntersectionC<
  [
    t.TypeC<{
      id: t.StringC
      type:
        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
        | t.UnionC<
            [
              t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
              t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
            ]
          >
      publisher: t.IntersectionC<
        [
          t.TypeC<{}>,
          t.PartialC<{
            id: t.StringC
            logo: UrlFromStringC
            name: t.StringC
            homepage: UrlFromStringC
            url: UrlFromStringC
            account: t.IntersectionC<[t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]>
          }>
        ]
      >
      created: DateFromISOStringC
    }>,
    t.PartialC<{
      steps: t.RecordC<
        t.StringC,
        t.IntersectionC<
          [
            t.TypeC<{
              actions: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{
                      outputs: t.ArrayC<
                        t.IntersectionC<
                          [
                            t.TypeC<{}>,
                            t.PartialC<{
                              published: DateFromISOStringC
                              id: t.StringC
                              doi: t.StringC
                              type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                              content: t.ArrayC<
                                t.IntersectionC<
                                  [
                                    t.TypeC<{
                                      type:
                                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                        | t.UnionC<
                                            [
                                              t.ArrayC<
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              >,
                                              t.UnionC<
                                                [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                              >
                                            ]
                                          >
                                    }>,
                                    t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                                  ]
                                >
                              >
                            }>
                          ]
                        >
                      >
                      participants: t.ArrayC<
                        t.IntersectionC<
                          [
                            t.TypeC<{
                              actor: t.UnionC<
                                [
                                  t.TypeC<{
                                    type:
                                      | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                      | t.UnionC<
                                          [
                                            t.ArrayC<
                                              t.UnionC<
                                                [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                              >
                                            >,
                                            t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                          ]
                                        >
                                    name: t.StringC
                                  }>,
                                  t.UnknownC
                                ]
                              >
                              role: t.StringC
                            }>,
                            t.PartialC<{
                              id: t.StringC
                              type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]>
                            }>
                          ]
                        >
                      >
                    }>,
                    t.PartialC<{ id: t.StringC }>
                  ]
                >
              >
              inputs: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{}>,
                    t.PartialC<{
                      published: DateFromISOStringC
                      id: t.StringC
                      doi: t.StringC
                      type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                      content: t.ArrayC<
                        t.IntersectionC<
                          [
                            t.TypeC<{
                              type:
                                | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                | t.UnionC<
                                    [
                                      t.ArrayC<
                                        t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                      >,
                                      t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                    ]
                                  >
                            }>,
                            t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                          ]
                        >
                      >
                    }>
                  ]
                >
              >
              assertions: t.ArrayC<t.UnknownC>
            }>,
            t.PartialC<{ id: t.StringC; 'next-step': t.StringC; 'previous-step': t.StringC }>
          ]
        >
      >
      'first-step': t.StringC
      updated: DateFromISOStringC
    }>
  ]
>
```

Added in v0.1.0

## DocmapAction

**Signature**

```ts
export declare const DocmapAction: t.IntersectionC<
  [
    t.TypeC<{
      outputs: t.ArrayC<
        t.IntersectionC<
          [
            t.TypeC<{}>,
            t.PartialC<{
              published: DateFromISOStringC
              id: t.StringC
              doi: t.StringC
              type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
              content: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{
                      type:
                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                        | t.UnionC<
                            [
                              t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                              t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                            ]
                          >
                    }>,
                    t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                  ]
                >
              >
            }>
          ]
        >
      >
      participants: t.ArrayC<
        t.IntersectionC<
          [
            t.TypeC<{
              actor: t.UnionC<
                [
                  t.TypeC<{
                    type:
                      | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                      | t.UnionC<
                          [
                            t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                            t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                          ]
                        >
                    name: t.StringC
                  }>,
                  t.UnknownC
                ]
              >
              role: t.StringC
            }>,
            t.PartialC<{ id: t.StringC; type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]> }>
          ]
        >
      >
    }>,
    t.PartialC<{ id: t.StringC }>
  ]
>
```

Added in v0.1.0

## DocmapActionT (type alias)

**Signature**

```ts
export type DocmapActionT = t.TypeOf<typeof DocmapAction>
```

Added in v0.1.0

## DocmapActor

**Signature**

```ts
export declare const DocmapActor: t.UnionC<
  [
    t.TypeC<{
      type:
        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
        | t.UnionC<
            [
              t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
              t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
            ]
          >
      name: t.StringC
    }>,
    t.UnknownC
  ]
>
```

Added in v0.1.0

## DocmapActorT (type alias)

**Signature**

```ts
export type DocmapActorT = t.TypeOf<typeof DocmapActor>
```

Added in v0.1.0

## DocmapManifestation

**Signature**

```ts
export declare const DocmapManifestation: t.IntersectionC<
  [
    t.TypeC<{
      type:
        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
        | t.UnionC<
            [
              t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
              t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
            ]
          >
    }>,
    t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
  ]
>
```

Added in v0.1.0

## DocmapManifestationT (type alias)

**Signature**

```ts
export type DocmapManifestationT = t.TypeOf<typeof DocmapManifestation>
```

Added in v0.1.0

## DocmapOnlineAccount

**Signature**

```ts
export declare const DocmapOnlineAccount: t.IntersectionC<
  [t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]
>
```

Added in v0.1.0

## DocmapOnlineAccountT (type alias)

**Signature**

```ts
export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>
```

Added in v0.1.0

## DocmapPublisher

**Signature**

```ts
export declare const DocmapPublisher: t.IntersectionC<
  [
    t.TypeC<{}>,
    t.PartialC<{
      id: t.StringC
      logo: UrlFromStringC
      name: t.StringC
      homepage: UrlFromStringC
      url: UrlFromStringC
      account: t.IntersectionC<[t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]>
    }>
  ]
>
```

Added in v0.1.0

## DocmapPublisherT (type alias)

**Signature**

```ts
export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>
```

Added in v0.1.0

## DocmapRoleInTime

**Signature**

```ts
export declare const DocmapRoleInTime: t.IntersectionC<
  [
    t.TypeC<{
      actor: t.UnionC<
        [
          t.TypeC<{
            type:
              | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
              | t.UnionC<
                  [
                    t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                    t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                  ]
                >
            name: t.StringC
          }>,
          t.UnknownC
        ]
      >
      role: t.StringC
    }>,
    t.PartialC<{ id: t.StringC; type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]> }>
  ]
>
```

Added in v0.1.0

## DocmapRoleInTimeT (type alias)

**Signature**

```ts
export type DocmapRoleInTimeT = t.TypeOf<typeof DocmapRoleInTime>
```

Added in v0.1.0

## DocmapStep

**Signature**

```ts
export declare const DocmapStep: t.IntersectionC<
  [
    t.TypeC<{
      actions: t.ArrayC<
        t.IntersectionC<
          [
            t.TypeC<{
              outputs: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{}>,
                    t.PartialC<{
                      published: DateFromISOStringC
                      id: t.StringC
                      doi: t.StringC
                      type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                      content: t.ArrayC<
                        t.IntersectionC<
                          [
                            t.TypeC<{
                              type:
                                | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                | t.UnionC<
                                    [
                                      t.ArrayC<
                                        t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                      >,
                                      t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                    ]
                                  >
                            }>,
                            t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                          ]
                        >
                      >
                    }>
                  ]
                >
              >
              participants: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{
                      actor: t.UnionC<
                        [
                          t.TypeC<{
                            type:
                              | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                              | t.UnionC<
                                  [
                                    t.ArrayC<
                                      t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                    >,
                                    t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                  ]
                                >
                            name: t.StringC
                          }>,
                          t.UnknownC
                        ]
                      >
                      role: t.StringC
                    }>,
                    t.PartialC<{
                      id: t.StringC
                      type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]>
                    }>
                  ]
                >
              >
            }>,
            t.PartialC<{ id: t.StringC }>
          ]
        >
      >
      inputs: t.ArrayC<
        t.IntersectionC<
          [
            t.TypeC<{}>,
            t.PartialC<{
              published: DateFromISOStringC
              id: t.StringC
              doi: t.StringC
              type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
              content: t.ArrayC<
                t.IntersectionC<
                  [
                    t.TypeC<{
                      type:
                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                        | t.UnionC<
                            [
                              t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                              t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                            ]
                          >
                    }>,
                    t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                  ]
                >
              >
            }>
          ]
        >
      >
      assertions: t.ArrayC<t.UnknownC>
    }>,
    t.PartialC<{ id: t.StringC; 'next-step': t.StringC; 'previous-step': t.StringC }>
  ]
>
```

Added in v0.1.0

## DocmapStepT (type alias)

**Signature**

```ts
export type DocmapStepT = t.TypeOf<typeof DocmapStep>
```

Added in v0.1.0

## DocmapT (type alias)

**Signature**

```ts
export type DocmapT = t.TypeOf<typeof Docmap>
```

Added in v0.1.0

## DocmapThing

**Signature**

```ts
export declare const DocmapThing: t.IntersectionC<
  [
    t.TypeC<{}>,
    t.PartialC<{
      published: DateFromISOStringC
      id: t.StringC
      doi: t.StringC
      type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
      content: t.ArrayC<
        t.IntersectionC<
          [
            t.TypeC<{
              type:
                | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                | t.UnionC<
                    [
                      t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                      t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                    ]
                  >
            }>,
            t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
          ]
        >
      >
    }>
  ]
>
```

Added in v0.1.0

## DocmapThingT (type alias)

**Signature**

```ts
export type DocmapThingT = t.TypeOf<typeof DocmapThing>
```

Added in v0.1.0

## DocmapsFactory

DocmapsFactory

The DocmapsFactory is a map from @type keys to the relevant type codecs.
This is only used in the Typed Graph Extraction code.

**Signature**

```ts
export declare const DocmapsFactory: {
  'web-page': t.IntersectionC<
    [
      t.TypeC<{
        type:
          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
          | t.UnionC<
              [
                t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
              ]
            >
      }>,
      t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
    ]
  >
  docmap: t.IntersectionC<
    [
      t.TypeC<{
        id: t.StringC
        type:
          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
          | t.UnionC<
              [
                t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
              ]
            >
        publisher: t.IntersectionC<
          [
            t.TypeC<{}>,
            t.PartialC<{
              id: t.StringC
              logo: UrlFromStringC
              name: t.StringC
              homepage: UrlFromStringC
              url: UrlFromStringC
              account: t.IntersectionC<[t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]>
            }>
          ]
        >
        created: DateFromISOStringC
      }>,
      t.PartialC<{
        steps: t.RecordC<
          t.StringC,
          t.IntersectionC<
            [
              t.TypeC<{
                actions: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{
                        outputs: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{}>,
                              t.PartialC<{
                                published: DateFromISOStringC
                                id: t.StringC
                                doi: t.StringC
                                type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                                content: t.ArrayC<
                                  t.IntersectionC<
                                    [
                                      t.TypeC<{
                                        type:
                                          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                          | t.UnionC<
                                              [
                                                t.ArrayC<
                                                  t.UnionC<
                                                    [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                  >
                                                >,
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              ]
                                            >
                                      }>,
                                      t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                                    ]
                                  >
                                >
                              }>
                            ]
                          >
                        >
                        participants: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                actor: t.UnionC<
                                  [
                                    t.TypeC<{
                                      type:
                                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                        | t.UnionC<
                                            [
                                              t.ArrayC<
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              >,
                                              t.UnionC<
                                                [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                              >
                                            ]
                                          >
                                      name: t.StringC
                                    }>,
                                    t.UnknownC
                                  ]
                                >
                                role: t.StringC
                              }>,
                              t.PartialC<{
                                id: t.StringC
                                type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]>
                              }>
                            ]
                          >
                        >
                      }>,
                      t.PartialC<{ id: t.StringC }>
                    ]
                  >
                >
                inputs: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{}>,
                      t.PartialC<{
                        published: DateFromISOStringC
                        id: t.StringC
                        doi: t.StringC
                        type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                        content: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                type:
                                  | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                  | t.UnionC<
                                      [
                                        t.ArrayC<
                                          t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                        >,
                                        t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                      ]
                                    >
                              }>,
                              t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                            ]
                          >
                        >
                      }>
                    ]
                  >
                >
                assertions: t.ArrayC<t.UnknownC>
              }>,
              t.PartialC<{ id: t.StringC; 'next-step': t.StringC; 'previous-step': t.StringC }>
            ]
          >
        >
        'first-step': t.StringC
        updated: DateFromISOStringC
      }>
    ]
  >
  'https://w3id.org/docmaps/v0/Docmap': t.IntersectionC<
    [
      t.TypeC<{
        id: t.StringC
        type:
          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
          | t.UnionC<
              [
                t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
              ]
            >
        publisher: t.IntersectionC<
          [
            t.TypeC<{}>,
            t.PartialC<{
              id: t.StringC
              logo: UrlFromStringC
              name: t.StringC
              homepage: UrlFromStringC
              url: UrlFromStringC
              account: t.IntersectionC<[t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]>
            }>
          ]
        >
        created: DateFromISOStringC
      }>,
      t.PartialC<{
        steps: t.RecordC<
          t.StringC,
          t.IntersectionC<
            [
              t.TypeC<{
                actions: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{
                        outputs: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{}>,
                              t.PartialC<{
                                published: DateFromISOStringC
                                id: t.StringC
                                doi: t.StringC
                                type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                                content: t.ArrayC<
                                  t.IntersectionC<
                                    [
                                      t.TypeC<{
                                        type:
                                          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                          | t.UnionC<
                                              [
                                                t.ArrayC<
                                                  t.UnionC<
                                                    [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                  >
                                                >,
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              ]
                                            >
                                      }>,
                                      t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                                    ]
                                  >
                                >
                              }>
                            ]
                          >
                        >
                        participants: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                actor: t.UnionC<
                                  [
                                    t.TypeC<{
                                      type:
                                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                        | t.UnionC<
                                            [
                                              t.ArrayC<
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              >,
                                              t.UnionC<
                                                [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                              >
                                            ]
                                          >
                                      name: t.StringC
                                    }>,
                                    t.UnknownC
                                  ]
                                >
                                role: t.StringC
                              }>,
                              t.PartialC<{
                                id: t.StringC
                                type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]>
                              }>
                            ]
                          >
                        >
                      }>,
                      t.PartialC<{ id: t.StringC }>
                    ]
                  >
                >
                inputs: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{}>,
                      t.PartialC<{
                        published: DateFromISOStringC
                        id: t.StringC
                        doi: t.StringC
                        type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                        content: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                type:
                                  | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                  | t.UnionC<
                                      [
                                        t.ArrayC<
                                          t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                        >,
                                        t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                      ]
                                    >
                              }>,
                              t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                            ]
                          >
                        >
                      }>
                    ]
                  >
                >
                assertions: t.ArrayC<t.UnknownC>
              }>,
              t.PartialC<{ id: t.StringC; 'next-step': t.StringC; 'previous-step': t.StringC }>
            ]
          >
        >
        'first-step': t.StringC
        updated: DateFromISOStringC
      }>
    ]
  >
  Docmap: t.IntersectionC<
    [
      t.TypeC<{
        id: t.StringC
        type:
          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
          | t.UnionC<
              [
                t.ArrayC<t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>>,
                t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
              ]
            >
        publisher: t.IntersectionC<
          [
            t.TypeC<{}>,
            t.PartialC<{
              id: t.StringC
              logo: UrlFromStringC
              name: t.StringC
              homepage: UrlFromStringC
              url: UrlFromStringC
              account: t.IntersectionC<[t.TypeC<{ id: t.StringC }>, t.PartialC<{ service: UrlFromStringC }>]>
            }>
          ]
        >
        created: DateFromISOStringC
      }>,
      t.PartialC<{
        steps: t.RecordC<
          t.StringC,
          t.IntersectionC<
            [
              t.TypeC<{
                actions: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{
                        outputs: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{}>,
                              t.PartialC<{
                                published: DateFromISOStringC
                                id: t.StringC
                                doi: t.StringC
                                type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                                content: t.ArrayC<
                                  t.IntersectionC<
                                    [
                                      t.TypeC<{
                                        type:
                                          | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                          | t.UnionC<
                                              [
                                                t.ArrayC<
                                                  t.UnionC<
                                                    [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                  >
                                                >,
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              ]
                                            >
                                      }>,
                                      t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                                    ]
                                  >
                                >
                              }>
                            ]
                          >
                        >
                        participants: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                actor: t.UnionC<
                                  [
                                    t.TypeC<{
                                      type:
                                        | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                        | t.UnionC<
                                            [
                                              t.ArrayC<
                                                t.UnionC<
                                                  [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                                >
                                              >,
                                              t.UnionC<
                                                [t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]
                                              >
                                            ]
                                          >
                                      name: t.StringC
                                    }>,
                                    t.UnknownC
                                  ]
                                >
                                role: t.StringC
                              }>,
                              t.PartialC<{
                                id: t.StringC
                                type: t.UnionC<[t.LiteralC<'pro:roleintime'>, t.LiteralC<'pro:RoleInTime'>]>
                              }>
                            ]
                          >
                        >
                      }>,
                      t.PartialC<{ id: t.StringC }>
                    ]
                  >
                >
                inputs: t.ArrayC<
                  t.IntersectionC<
                    [
                      t.TypeC<{}>,
                      t.PartialC<{
                        published: DateFromISOStringC
                        id: t.StringC
                        doi: t.StringC
                        type: t.UnionC<[t.ArrayC<t.StringC>, t.StringC]>
                        content: t.ArrayC<
                          t.IntersectionC<
                            [
                              t.TypeC<{
                                type:
                                  | t.UnionC<[t.LiteralC<string>, t.ArrayC<t.LiteralC<string>>]>
                                  | t.UnionC<
                                      [
                                        t.ArrayC<
                                          t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                        >,
                                        t.UnionC<[t.LiteralC<string>, t.LiteralC<string>, ...t.LiteralC<string>[]]>
                                      ]
                                    >
                              }>,
                              t.PartialC<{ id: t.StringC; service: UrlFromStringC; url: UrlFromStringC }>
                            ]
                          >
                        >
                      }>
                    ]
                  >
                >
                assertions: t.ArrayC<t.UnknownC>
              }>,
              t.PartialC<{ id: t.StringC; 'next-step': t.StringC; 'previous-step': t.StringC }>
            ]
          >
        >
        'first-step': t.StringC
        updated: DateFromISOStringC
      }>
    ]
  >
}
```

Added in v0.1.0

## IRI (type alias)

**Signature**

```ts
export type IRI = string
```

Added in v0.1.0
