import * as t from 'io-ts';
export type IRI = string;

export const DocmapOnlineAccount = t.intersection([
  t.type({
    id: t.string,
    // TODO: is actually a `foaf:onlineaccount`, but that is not specified in the JSON_LD. TBD whetehr that would be enough of a constraint.
  }),
  // type intersects partial to add optional fields
  t.partial({
    service: t.string,
    'type': t.union([
      t.literal('foaf:onlineaccount'),
      t.literal('foaf:OnlineAccount'),
    ]),
  }),
]);

export const DocmapPublisher = t.intersection([
  t.type({
    id: t.string,
  }),
  t.partial({
    // TODO: add url typing?
    logo: t.string,
    name: t.string,
    homepage: t.string,
    url: t.string,
    account: DocmapOnlineAccount,
  }),
]);

export const DocmapManifestation = t.intersection([
  t.type({
    // type: t.union([
    // TODO: this looks like it might need to be an AnyType or something. Manifestations are extensive.
    'type':  t.literal('web-page'),
    // ]),
  }),
  t.partial({
    id: t.string,
    service: t.string,
    url: t.string,
  }),
]);

export const DocmapActor = t.union([
  t.type({
    'type': t.literal('person'),
    name: t.string,
  }),
  // TODO:  this can be any FOAF type, based on our context spec.
  t.unknown,
]);

export const DocmapRoleInTime = t.intersection([
  t.type({
    actor: DocmapActor,
    // TODO: this may need to be more specific to the RoleInTimes.
    role: t.string,
  }),
  t.partial({
    id: t.string,
    type: t.union([
      t.literal('pro:roleintime'),
      t.literal('pro:RoleInTime'),
    ]),
  }),
]);

export const DocmapThing = t.intersection([
  t.type({
    // TODO this is not so useful as partial-only
  }),
  t.partial({
    // TODO use DateFromString for better parsing:
    //    https://github.com/gcanti/io-ts/blob/dedb64e05328417ecd3d87e00008d9e72130374a/index.md#custom-types
    published: t.string,
    id: t.string,
    doi: t.string,
    'type': t.string, // TODO this Type can be more specific ('web-page', 'preprint', etc)
    content: t.array(DocmapManifestation),
  }),
]);

export const DocmapAction = t.intersection([
  t.type({
    // type: t.literal('https://w3id.org/docmaps/v0/DocmapActionShape'),
    outputs: t.array(DocmapThing),
    participants: t.array(DocmapRoleInTime),
  }),
  t.partial({
    // TODO - this will probably be an independently-publishable thing and should not be optional.
    id: t.string,
  }),
]);

export const DocmapStep = t.intersection([
  // This is used as umbrella for any type that can be directly extracted by framing
  // using this library. Currently, we only select by @type, so it must have a @type.
  t.type({
    // type: t.literal('https://w3id.org/docmaps/v0/DocmapStepShape'),
    actions: t.array(DocmapAction),
    inputs: t.array(DocmapThing),

    // TODO: make this smarter
    assertions: t.array(t.unknown),
  }),
  t.partial({
    id: t.string,
    'next-step': t.string,
    'previous-step': t.string,
  })
]);

function arrayOrOneOf(literalStrings: string[]) {
  const [one, two, ...r] = literalStrings;

  if (!one) {
      throw "Never use arrayOrOneOf without any options!"
  }
  if (!two) {
      const onlyOption = t.literal(one);
      return t.union([onlyOption, t.array(onlyOption)]);
  }

  const literals = t.union([
    t.literal(one),
    t.literal(two),
    ...r.map((e) => t.literal(e)),
  ]);

  return t.union([
    t.array(literals),
    literals,
  ]);
}

// TODO: use smart validation rules for custom io-ts docmap type, such as next-steps referring to steps that exist
//   and any other value-dependent type rules
export const Docmap = t.intersection([
  t.type({
    id: t.string,
    'type': t.literal('docmap'),
    // 'type': arrayOrOneOf([
    //   // TODO support something where docmaps: is prefixed
    //   // t.literal('docmaps:docmap'),
    //   // t.literal('docmaps:Docmap'),
    //   // or abbreviate the Base somehow on the w3id docmap repo.
    //   'docmap',
    //   'Docmap',
    //   'https://w3id.org/docmaps/v0/Docmap',
    // ]),
    publisher: DocmapPublisher,
    // TODO: required contents of these date strings,
    created: t.string,
  }),
  t.partial({
    steps: t.record(t.string, DocmapStep),
    'first-step': t.string,
    updated: t.string,
  }),
]);

export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>;
export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;
export type DocmapManifestationT = t.TypeOf<typeof DocmapManifestation>;
export type DocmapStepT = t.TypeOf<typeof DocmapStep>;
export type DocmapT = t.TypeOf<typeof Docmap>;
export type DocmapActionT = t.TypeOf<typeof DocmapAction>;
export type DocmapThingT = t.TypeOf<typeof DocmapThing>;
export type DocmapRoleInTimeT = t.TypeOf<typeof DocmapRoleInTime>;
export type DocmapActorT = t.TypeOf<typeof DocmapActor>;

export const DocmapsFactory = {
  'web-page': DocmapManifestation,
  'docmap': Docmap,
  'https://w3id.org/docmaps/v0/Docmap': Docmap,
  'Docmap': Docmap,
};


// export const AnyDocmap = t.union([
//   DocmapPublisher,
//   DocmapManifestation,
//   Docmap,
// ]);
//
// export type AnyDocmapT = t.TypeOf<typeof AnyDocmap>;
// export type AnyDocmapType
//   = Docmap
//   | DocmapAction
//   | DocmapManifestation
//   | DocmapOnlineAccount
//   | DocmapPublisher
//   | DocmapRoleInTime
//   | DocmapStep
//   | DocmapThing
//   | DocmapStepProps;
