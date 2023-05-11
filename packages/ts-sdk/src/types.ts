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

export const DocmapOnlineAccount = t.intersection([
  t.type({
    id: t.string,
    // TODO: is actually a `foaf:onlineaccount`, but that is not specified in the JSON_LD. TBD whetehr that would be enough of a constraint.
  }),
  // t.type intersects t.partial to add optional fields
  t.partial({
    service: UrlFromString,
  }),
])

export const DocmapPublisher = t.intersection([
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
    account: DocmapOnlineAccount,
  }),
])

export const DocmapManifestation = t.intersection([
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

export const DocmapActor = t.union([
  t.type({
    type: arrayOrOneOf(['person']),
    name: t.string,
  }),
  // TODO:  this can be any FOAF type, based on our context spec.
  t.unknown,
])

export const DocmapRoleInTime = t.intersection([
  t.type({
    actor: DocmapActor,
    // TODO: this may need to be more specific to the RoleInTimes.
    role: t.string,
  }),
  t.partial({
    id: t.string,
    type: t.union([t.literal('pro:roleintime'), t.literal('pro:RoleInTime')]),
  }),
])

export const DocmapThing = t.intersection([
  t.type({
    // TODO this is not so useful as partial-only
  }),
  t.partial({
    // TODO use DateFromString for better parsing:
    //    https://github.com/gcanti/io-ts/blob/dedb64e05328417ecd3d87e00008d9e72130374a/index.md#custom-types
    published: DateFromUnknown,
    id: t.string,
    doi: t.string,
    type: t.union([t.array(t.string), t.string]), // TODO this Type can be more specific ('web-page', 'preprint', etc)
    content: t.array(DocmapManifestation),
  }),
])

export const DocmapAction = t.intersection([
  t.type({
    outputs: t.array(DocmapThing),
    participants: t.array(DocmapRoleInTime),
  }),
  t.partial({
    // TODO - this will probably be an independently-publishable thing and id should not be optional.
    id: t.string,
  }),
])

const DocmapStatus = t.string

export const DocmapAssertion = t.intersection([
  t.type({
    item: t.unknown,
    status: DocmapStatus,
  }),
  t.partial({
    happened: DateFromUnknown,
  }),
])

export const DocmapStep = t.intersection([
  t.type({
    actions: t.array(DocmapAction),
    inputs: t.array(DocmapThing),

    // TODO: make this smarter
    assertions: t.array(DocmapAssertion),
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
    id: t.string,
    // only one legal value, and fill it if absent
    '@context': fromNullable(
      t.literal('https://w3id.org/docmaps/context.jsonld'),
      'https://w3id.org/docmaps/context.jsonld',
    ),
    type: arrayOrOneOf([
      // TODO support something where docmaps: is prefixed
      // t.literal('docmaps:docmap'),
      // t.literal('docmaps:Docmap'),
      // or abbreviate the Base somehow on the w3id docmap repo.
      'docmap',
      'Docmap',
      'https://w3id.org/docmaps/v0/Docmap',
    ]),
    publisher: DocmapPublisher,
    // TODO: required contents of these date strings,
    created: DateFromUnknown,
  }),
  t.partial({
    steps: t.record(t.string, DocmapStep),
    'first-step': t.string,
    updated: DateFromUnknown,
  }),
])

export type IRI = string
export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>
export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>
export type DocmapManifestationT = t.TypeOf<typeof DocmapManifestation>
export type DocmapStepT = t.TypeOf<typeof DocmapStep>
export type DocmapT = t.TypeOf<typeof Docmap>
export type DocmapActionT = t.TypeOf<typeof DocmapAction>
export type DocmapThingT = t.TypeOf<typeof DocmapThing>
export type DocmapRoleInTimeT = t.TypeOf<typeof DocmapRoleInTime>
export type DocmapActorT = t.TypeOf<typeof DocmapActor>
export type DocmapAssertionT = t.TypeOf<typeof DocmapAssertion>

/**  DocmapsFactory
 *
 *  The DocmapsFactory is a map from @type keys to the relevant type codecs.
 *  This is only used in the Typed Graph Extraction code.
 */
export const DocmapsFactory = {
  'web-page': DocmapManifestation,
  docmap: Docmap,
  'https://w3id.org/docmaps/v0/Docmap': Docmap,
  Docmap: Docmap,
}
