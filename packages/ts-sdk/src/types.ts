import * as t from 'io-ts';
export type IRI = string;

// enum DocmapTypeIRIs {
//   Docmap = 'https://w3id.org/docmaps/v0/Docmap',
//   DocmapPublisher = 'https://w3id.org/docmaps/v0/DocmapPublisherShape',
// }

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
    'type': t.literal('foaf:onlineAccount'),
  }),
]);

export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;

// type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;

export const DocmapPublisher = t.intersection([
  t.type({
    id: t.string,
    type: t.literal('foaf:organization'),
  }),
  t.partial({
    // TODO: add url typing?
    logo: t.string,
    name: t.string,
    homepage: t.string,
    hasURL: t.string,
    account: DocmapOnlineAccount,
  }),
]);
export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>;

export const AnyDocmap = t.union([DocmapPublisher, DocmapOnlineAccount]);

export const DocmapsFactory = {
  'foaf:organization': DocmapPublisher,
};

//
// export type DocmapPublisher = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapPublisherShape';
//   logo?: string;
//   name?: string;
//   homepage?: string;
//   hasURL?: string;
//   onlineAccount?: DocmapOnlineAccount;
// }
//
// export type DocmapOnlineAccount = {
//   id: IRI;
//   '@type': 'https://w3id.org/docmaps/v0/DocmapOnlineAccountShape';
//   accountServiceHomepage?: string;
// }
//
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
