import * as t from 'io-ts'
import { fromNullable } from 'io-ts-types/lib/fromNullable'
import { UrlFromString, DateFromUnknown } from './util'

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

export const ContextUpsert = {
    // only one legal value, and fill it if absent
    '@context': fromNullable(
      t.literal('https://w3id.org/docmaps/context.jsonld'),
      'https://w3id.org/docmaps/context.jsonld',
    ),
}

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

export const Manifestation = t.intersection([
  t.type({
    // TODO: this looks like it might need to be an AnyType or something. Manifestations are extensive.
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

export const Actor = t.union([
  t.type({
    type: arrayOrOneOf(['person']),
    name: t.string,
  }),
  // TODO:  this can be any FOAF type, based on our context spec.
  t.unknown,
])

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

export const ThingType = arrayOrOneOf([
  'review',
  'preprint',
  'evaluation-summary',
  'review',
  'review-article',
  'author-response',
])

// TODO - now that we have Types, we could do more assertive
// shaping based on a given Type value implying certain fields must exist
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

export const Action = t.intersection([
  t.type({
    outputs: t.array(Thing),
    participants: t.array(RoleInTime),
  }),
  t.partial({
    // TODO - this will probably be an independently-publishable thing and id should not be optional.
    id: t.string,
  }),
])

const Status = t.string

export const Assertion = t.intersection([
  t.type({
    item: t.unknown,
    status: Status,
  }),
  t.partial({
    happened: DateFromUnknown,
  }),
])

export const Step = t.intersection([
  t.type({
    actions: t.array(Action),
    inputs: t.array(Thing),

    // TODO: make this smarter
    assertions: t.array(Assertion),
  }),
  t.partial({
    id: t.string,
    'next-step': t.string,
    'previous-step': t.string,
  }),
])

// TODO: use smart validation rules for custom io-ts docmap type, such as next-steps referring to steps that exist
//   and any other value-dependent type rules
export const Docmap = t.intersection([
  t.type({
    ...ContextUpsert,
    id: t.string,
    type: arrayOrOneOf([
      // TODO support something where docmaps: is prefixed
      // t.literal('docmaps:docmap'),
      // t.literal('docmaps:Docmap'),
      // or abbreviate the Base somehow on the w3id docmap repo.
      'docmap',
      'Docmap',
      'https://w3id.org/docmaps/v0/Docmap',
    ]),
    publisher: Publisher,
    // TODO: required contents of these date strings,
    created: DateFromUnknown,
  }),
  t.partial({
    steps: t.record(t.string, Step),
    'first-step': t.string,
    updated: DateFromUnknown,
  }),
])

export type IRI = string
export type PublisherT = t.TypeOf<typeof Publisher>
export type OnlineAccountT = t.TypeOf<typeof OnlineAccount>
export type ManifestationT = t.TypeOf<typeof Manifestation>
export type StepT = t.TypeOf<typeof Step>
export type DocmapT = t.TypeOf<typeof Docmap>
export type ActionT = t.TypeOf<typeof Action>
export type ThingT = t.TypeOf<typeof Thing>
export type RoleInTimeT = t.TypeOf<typeof RoleInTime>
export type ActorT = t.TypeOf<typeof Actor>
export type AssertionT = t.TypeOf<typeof Assertion>

/**  DocmapsFactory
 *
 *  The DocmapsFactory is a map from @type keys to the relevant type codecs.
 *  This is only used in the Typed Graph Extraction code.
 */
export const DocmapsFactory = {
  'web-page': Manifestation,
  docmap: Docmap,
  'https://w3id.org/docmaps/v0/Docmap': Docmap,
  Docmap: Docmap,
}
