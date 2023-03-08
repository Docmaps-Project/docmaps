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
    '@type': t.literal('https://w3id.org/docmaps/v0/DocmapOnlineAccountShape'),
  }),
  // type intersects partial to add optional fields
  t.partial({
    accountServiceHomepage: t.string,
  }),
]);

export type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;

// type DocmapOnlineAccountT = t.TypeOf<typeof DocmapOnlineAccount>;

export const DocmapPublisher = t.intersection([
  t.type({
    id: t.string,
    '@type': t.literal('https://w3id.org/docmaps/v0/DocmapPublisherShape'),
  }),
  t.partial({
    // TODO: add url typing?
    logo: t.string,
    name: t.string,
    homepage: t.string,
    hasURL: t.string,
    onlineAccount: DocmapOnlineAccount,
  }),
]);
export type DocmapPublisherT = t.TypeOf<typeof DocmapPublisher>;

export const AnyDocmap = t.union([DocmapPublisher, DocmapOnlineAccount]);

export const DocmapsFactory = {
  'https://w3id.org/docmaps/v0/DocmapPublisherShape': DocmapPublisher,
  'https://w3id.org/docmaps/v0/DocmapOnlineAccountShape': DocmapOnlineAccount,
};

// TODO add these in io-ts form instead
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
