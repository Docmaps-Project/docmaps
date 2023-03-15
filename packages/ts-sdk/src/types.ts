import * as t from 'io-ts';
export type IRI = string;

// export type Docmap = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/Docmap';
//   hasFirstStep: DocmapStep;
//   hasStep: DocmapStep[];
//   created: Date;
//   updated?: Date;
//   publisher: DocmapPublisher;
// }

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
    'type': t.union([
      t.literal('foaf:organization'),
      t.literal('foaf:Organization'),
    ]),
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
    // TODO is this optional?
    id: t.string,
    // type: t.union([
    // TODO: this looks like it might need to be an AnyType or something. Manifestations are extensive.
    type:  t.literal('web-page'),
    // ]),
  }),
  t.partial({
    service: t.string,
    url: t.string,
  }),
]);

export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>;
export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;
export type DocmapManifestationT = t.TypeOf<typeof DocmapManifestation>;

export const AnyDocmap = t.union([
  DocmapPublisher,
  DocmapManifestation
]);

export type AnyDocmapT = t.TypeOf<typeof AnyDocmap>;

export const DocmapsFactory = {
  'foaf:organization': DocmapPublisher,
  'web-page': DocmapManifestation,
};
//
// export const DocmapThing = t.type({
//   id: t.string,
//   type: t.literal('https://w3id.org/docmaps/v0/DocmapThingShape'),
//   publicationDate: t.union([t.Date, t.undefined]),
//   hasManifestation: t.array(DocmapManifestation),
//   doi: t.union([t.string, t.undefined]),
//   hasURL: t.union([t.string, t.undefined])
// });
//
// export const DocmapAction = t.type({
//   id: t.string,
//   type: t.literal('https://w3id.org/docmaps/v0/DocmapActionShape'),
//   produces: t.array(DocmapThing),
//   isDocumentContextFor: t.array(DocmapRoleInTime),
//   resultsInAcquiring: t.array(t.string)
// });
//
// export const DocmapStep = t.intersection([
//   t.type({
//     id: t.string,
//     type: t.literal('https://w3id.org/docmaps/v0/DocmapStepShape'),
//     isExecutedIn: DocmapAction
//   }),
//   t.partial({
//     hasNextStep: DocmapStep,
//     hasPreviousStep: DocmapStepProps
//   })
// ]);
//
// export const DocmapStepProps = t.type({
//   id: t.string,
//   type: t.literal('https://w3id.org/docmaps/v0/DocmapStepPropsShape'),
//   isExecutedIn: DocmapAction
// });

// export type DocmapStep = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapStepShape';
//   hasNextStep?: DocmapStep;
//   hasPreviousStep?: DocmapStepProps;
//   isExecutedIn: DocmapAction;
// } & DocmapStepProps ;
//
// export type DocmapStepProps = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapStepPropsShape';
//   isExecutedIn: DocmapAction;
// }
//
// export type DocmapAction = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapActionShape';
//   produces: DocmapThing[];
//   isDocumentContextFor: DocmapRoleInTime[];
//   resultsInAcquiring: IRI[];
// }
//
// export type DocmapRoleInTime = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapRoleInTimeShape';
//   isHeldBy: IRI;
//   withRole: IRI;
// }
//
// export type DocmapThing = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapThingShape';
//   publicationDate?: Date;
//   hasManifestation: DocmapManifestation[];
//   doi?: string;
//   hasURL?: string;
// }
//
// export type DocmapManifestation = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapManifestationShape';
//   accountServiceHomepage?: string;
//   hasURL?: string;
// }
//
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
//
//
// export const DocmapFactory: Record<string, typeof safePartialToT<AnyDocmapType> = {
//   'https://w3id.org/docmaps/v0/Docmap' : safePartialToT<Docmap>,
//   'https://w3id.org/docmaps/v0/DocmapPublisherShape' : safePartialToT<DocmapPublisher>,
//   'https://w3id.org/docmaps/v0/DocmapOnlineAccountShape' : safePartialToT<DocmapOnlineAccount>,
//   'https://w3id.org/docmaps/v0/DocmapStepShape' : safePartialToT<DocmapStep>,
//   'https://w3id.org/docmaps/v0/DocmapStepPropsShape' : safePartialToT<DocmapStepProps>,
//   'https://w3id.org/docmaps/v0/DocmapActionShape' : safePartialToT<DocmapAction>,
//   'https://w3id.org/docmaps/v0/DocmapRoleInTimeShape' : safePartialToT<DocmapRoleInTime>,
//   'https://w3id.org/docmaps/v0/DocmapThingShape' : safePartialToT<DocmapThing>,
//   'https://w3id.org/docmaps/v0/DocmapManifestationShape' : safePartialToT<DocmapManifestation >,
// };
