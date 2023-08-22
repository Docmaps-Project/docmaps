/**
 * Library of Docmaps encoders and types.
 *
 * @since 0.1.0
 */
import * as t from 'io-ts'
import { fromNullable } from 'io-ts-types/lib/fromNullable'
import { UrlFromString, DateFromUnknown, ArrayUpsertedEmpty } from './util'

function arrayOrOneOf(literalStrings: string[]) {
  const [one, two, ...r] = literalStrings

  if (!one) {
    throw 'Never use arrayOrOneOf without any options!'
  }
  if (!two) {
    const onlyOption = t.literal(one)
    return t.union([onlyOption, t.array(onlyOption)])
  }

  const literals = t.union([t.literal(one), t.literal(two), ...r.map((e) => t.literal(e))])

  return t.union([t.array(literals), literals])
}

/**
 * @since 0.9.0
 */
export const ContextUpsert = {
  // only one legal value, and fill it if absent
  '@context': fromNullable(
    t.literal('https://w3id.org/docmaps/context.jsonld'),
    'https://w3id.org/docmaps/context.jsonld',
  ),
}

/**
 * A `foaf:onlineAccount`, the online identity of some Agent (person, org, etc).
 *
 * @example
 * import { OnlineAccountT, OnlineAccount } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const A: Validation<OnlineAccountT> = OnlineAccount.decode({
 *   id: 'https://docmaps-project.github.io/ex/onlineaccount',
 *   service: 'https://docmaps-project.github.io/ex/onlineaccount/www',
 * });
 *
 * @since 0.1.0
 */
export const OnlineAccount = t.intersection([
  t.type({
    id: t.string,
    // TODO: is actually a `foaf:onlineaccount`, but that is not specified in the JSON_LD. TBD whetehr that would be enough of a constraint.
  }),
  // t.type intersects t.partial to add optional fields
  t.partial({
    service: UrlFromString,
  }),
])

/**
 * The publisher of a docmap
 *
 * @example
 * import { PublisherT, Publisher } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const A: Validation<PublisherT> = Publisher.decode({
 *   id: 'https://docmaps-project.github.io/ex/publisher',
 *   logo: 'https://docmaps-project.github.io/ex/publisher/logo',
 *   name: 'DocMaps',
 *   homepage: 'https://docmaps-project.github.io/ex/publisher/homepage',
 *   url: 'https://docmaps-project.github.io/ex/publisher/url',
 *   account: {
 *     id: 'https://docmaps-project.github.io/ex/onlineaccount',
 *     service: 'https://docmaps-project.github.io/ex/onlineaccount/www'
 *   }
 * });
 *
 * @since 0.1.0
 */
export const Publisher = t.intersection([
  t.type({
    // TODO this is not so useful as partial-only
  }),
  t.partial({
    // fields used by eLife
    id: t.string,

    logo: UrlFromString,
    name: t.string,
    homepage: UrlFromString,
    url: UrlFromString,
    account: OnlineAccount,
  }),
])

/**
 * A fabio:Manifestation, which may be included in an Output.
 *
 * @example
 * import { ManifestationT, Manifestation } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const A: Validation<ManifestationT> = Manifestation.decode({
 *   type: 'web-page',
 *   id: 'https://docmaps-project.github.io/ex/manifestation',
 *   service: 'https://docmaps-project.github.io/ex/manifestation/service',
 *   url: 'https://docmaps-project.github.io/ex/manifestation/url'
 * });
 *
 * @since 0.1.0
 */
export const Manifestation = t.intersection([
  t.type({
    // TODO: this looks like it might need to be an AnyType or something. Manifestations are extensive.
    //    - we are at least aware of EMBO using `type: text`.
    type: arrayOrOneOf([
      'web-page', // correctly used by eLife
    ]),
  }),
  t.partial({
    id: t.string,
    service: UrlFromString,
    url: UrlFromString,
  }),
])

/**
 * A pro:Agent . Can be almost anything in theory,
 * but currently only a Person.
 *
 * @example
 * import { ActorT, Actor } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const B: Validation<ActorT> = Actor.decode({
 *   type: 'person',
 *   name: 'John Doe'
 * });
 *
 * @since 0.1.0
 *
 * TODO: support organizations, etc as Agents.
 */
export const Actor = t.union([
  t.type({
    type: arrayOrOneOf(['person']),
    name: t.string,
  }),
  // TODO:  this can be any FOAF type, based on our context spec.
  t.unknown,
])

/**
 * A pro:RoleInTime ; How a participant participated in an action
 *
 * @example
 * import { RoleInTimeT, RoleInTime } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<RoleInTimeT> = RoleInTime.decode({
 *   actor: {
 *     type: 'person',
 *     name: 'John Doe'
 *   },
 *   role: 'author'
 * });
 *
 * @since 0.1.0
 */
export const RoleInTime = t.intersection([
  t.type({
    actor: Actor,
    // TODO: this may need to be more specific to the RoleInTimes.
    role: t.string,
  }),
  t.partial({
    id: t.string,
    type: t.union([t.literal('pro:roleintime'), t.literal('pro:RoleInTime')]),
  }),
])

/**
 * The allowed types for a Thing (output or input).
 *
 * @since 0.9.0
 */
export const ThingType = arrayOrOneOf([
  'review',
  'preprint',
  'evaluation-summary',
  'review',
  'review-article',
  'journal-article',
  'editorial',
  'comment',
  'reply',
])

/**
 * An output or input.
 *
 * @example
 * import { ThingT, Thing } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<ThingT> = Thing.decode({
 *   published: '2020-01-01',
 *   id: '123456',
 *   doi: '10.12345/abcdef',
 *   type: 'Article',
 *   content: [{
 *     type: 'text',
 *     text: 'This is an example of a thing'
 *   }]
 * });
 *
 * @since 0.1.0
 *
 * TODO - now that we have Types, we could do more assertive
 * shaping based on a given Type value implying certain fields must exist *
 */
export const Thing = t.intersection([
  t.type({
    // TODO this is not so useful as partial-only
  }),
  t.partial({
    published: DateFromUnknown,
    id: t.string,
    doi: t.string,
    type: ThingType,
    content: t.array(Manifestation),
  }),
])

/**
 * An action taken in a step.
 *
 * @example
 * import { ActionT, Action } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<ActionT> = Action.decode({
 *   outputs: [{
 *     published: '2020-01-01',
 *     id: '123456',
 *     doi: '10.12345/abcdef',
 *     type: 'Article',
 *     content: [{
 *       type: 'text',
 *       text: 'This is an example of a thing'
 *     }]
 *   }],
 *   participants: [{
 *     actor: {
 *       type: 'person',
 *       name: 'John Doe'
 *     },
 *     role: 'author'
 *   }],
 *   id: '123456'
 * });
 *
 * @since 0.1.0
 *
 * TODO - this will probably be an independently-publishable thing and id should not be optional.
 */
export const Action = t.intersection([
  t.type({
    // outputs: fromNullable(t.array(Thing), []),
    outputs: ArrayUpsertedEmpty(Thing),
    participants: ArrayUpsertedEmpty(RoleInTime),
  }),
  t.partial({
    id: t.string,
  }),
])

const Status = t.string

/**
 * A claim about a document acquiring a status that is asserted by a certain step
 *
 * @example
 * import { AssertionT, Assertion } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<AssertionT> = Assertion.decode({
 *   item: {
 *     type: 'Article',
 *     id: '123456'
 *   },
 *   status: 'accepted',
 *   happened: '2020-01-01'
 * });
 *
 * @since 0.9.0
 *
 * TODO: make this smarter
 */
export const Assertion = t.intersection([
  t.type({
    item: t.unknown,
    status: Status,
  }),
  t.partial({
    happened: DateFromUnknown,
  }),
])

/**
 * One step in a docmap's workflow. This is an ephemeral object (i.e., the same
 * set of actions may appear in a step with a different content hash).
 *
 * @example
 * import { StepT, Step } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<StepT> = Step.decode({
 *   actions: [{
 *     outputs: [{
 *       published: '2020-01-01',
 *       id: '123456',
 *       doi: '10.12345/abcdef',
 *       type: 'Article',
 *       content: [{
 *         type: 'text',
 *         text: 'This is an example of a thing'
 *       }]
 *     }],
 *     participants: [{
 *       actor: {
 *         type: 'person',
 *         name: 'John Doe'
 *       },
 *       role: 'author'
 *     }],
 *     id: '123456'
 *   }],
 *   inputs: [{
 *     published: '2020-01-01',
 *     id: '123456',
 *     doi: '10.12345/abcdef',
 *     type: 'Article',
 *     content: [{
 *       type: 'text',
 *       text: 'This is an example of a thing'
 *     }]
 *   }],
 *   assertions: [{
 *     item: {
 *       type: 'Article',
 *       id: '123456'
 *     },
 *     status: 'accepted',
 *     happened: '2020-01-01'
 *   }],
 *   id: 'step-2',
 *   'previous-step': 'step-1'
 * });
 * @since 0.1.0
 */
export const Step = t.intersection([
  t.type({
    actions: ArrayUpsertedEmpty(Action),
    inputs: ArrayUpsertedEmpty(Thing),
    assertions: ArrayUpsertedEmpty(Assertion),
  }),
  t.partial({
    id: t.string,
    // TODO: this is a hacky solution. I would like these fields to be stripped if they are null.
    'next-step': t.union([t.string, t.null]),
    'previous-step': t.union([t.string, t.null]),
  }),
])

/**
 * @example
 * import { DocmapT, Docmap } from 'docmaps-sdk';
 * import { Validation } from 'io-ts';
 *
 * const C: Validation<DocmapT> = Docmap.decode({
 *   context: [{
 *     type: 'schema',
 *     value: 'https://schema.org/'
 *   }],
 *   id: '123456',
 *   type: 'Docmap',
 *   publisher: {
 *     type: 'person',
 *     name: 'John Doe'
 *   },
 *   created: '2020-01-01',
 *   steps: {
 *     'step-1': {
 *       actions: [{
 *         outputs: [{
 *           published: '2020-01-01',
 *           id: '123456',
 *           doi: '10.12345/abcdef',
 *           type: 'Article',
 *           content: [{
 *             type: 'text',
 *             text: 'This is an example of a thing'
 *           }]
 *         }],
 *         participants: [{
 *           actor: {
 *             type: 'person',
 *             name: 'John Doe'
 *           },
 *           role: 'author'
 *         }],
 *         id: '123456'
 *       }],
 *       inputs: [{
 *         published: '2020-01-01',
 *         id: '123456',
 *         doi: '10.12345/abcdef',
 *         type: 'Article',
 *         content: [{
 *           type: 'text',
 *           text: 'This is an example of a thing'
 *         }]
 *       }],
 *       assertions: [{
 *         item: {
 *           type: 'Article',
 *           id: '123456'
 *         },
 *         status: 'accepted',
 *         happened: '2020-01-01'
 *       }],
 *       id: '123456',
 *       'next-step': 'step-2',
 *     },
 *     'step-2': {
 *       //...
 *     }
 *   },
 *   'first-step': 'step-1',
 *   updated: '2020-01-01'
 * });
 *
 * @since 0.1.0
 *
 * TODO: use smart validation rules for custom io-ts docmap type, such as next-steps referring to steps that exist
 *   and any other value-dependent type rules. see https://github.com/Docmaps-Project/docmaps/issues/23
 *
 * TODO: support something where docmaps: is prefixed
 * t.literal('docmaps:docmap'),
 * t.literal('docmaps:Docmap'),
 * or abbreviate the Base somehow on the w3id docmap repo.
 */
export const Docmap = t.intersection([
  t.type({
    ...ContextUpsert,
    id: t.string,
    type: arrayOrOneOf(['docmap', 'Docmap', 'https://w3id.org/docmaps/v0/Docmap']),
    publisher: Publisher,
    created: DateFromUnknown,
  }),
  t.partial({
    steps: t.record(t.string, Step),
    'first-step': t.string,
    updated: DateFromUnknown,
  }),
])

/**
 * @since 0.1.0
 */
export type IRI = string
/**
 * @since 0.1.0
 */
export type PublisherT = t.TypeOf<typeof Publisher>
/**
 * @since 0.1.0
 */
export type OnlineAccountT = t.TypeOf<typeof OnlineAccount>
/**
 * @since 0.1.0
 */
export type ManifestationT = t.TypeOf<typeof Manifestation>
/**
 * @since 0.1.0
 */
export type StepT = t.TypeOf<typeof Step>
/**
 * @since 0.1.0
 */
export type DocmapT = t.TypeOf<typeof Docmap>
/**
 * @since 0.1.0
 */
export type ActionT = t.TypeOf<typeof Action>
/**
 * @since 0.1.0
 */
export type ThingT = t.TypeOf<typeof Thing>
/**
 * @since 0.1.0
 */
export type RoleInTimeT = t.TypeOf<typeof RoleInTime>
/**
 * @since 0.1.0
 */
export type ActorT = t.TypeOf<typeof Actor>

/**  DocmapsFactory
 *
 *  The DocmapsFactory is a map from @type keys to the relevant type codecs.
 *
 *  This is only used in the Typed Graph Extraction code, which is experimental.
 *  Usage is available but not currently endorsed or supported.
 *
 * @since 0.1.0
 */
export const DocmapsFactory = {
  'web-page': Manifestation,
  docmap: Docmap,
  'https://w3id.org/docmaps/v0/Docmap': Docmap,
  Docmap: Docmap,
}
