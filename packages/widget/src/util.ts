export const WIDGET_SIZE: number = 500;
export const GRAPH_CANVAS_HEIGHT: number = 475;
export const GRAPH_CANVAS_ID: string = 'd3-canvas';
export const FIRST_NODE_RADIUS: number = 50;
export const NODE_RADIUS: number = 37.5;
export const RANK_SEPARATION: number = 100;
export type TypeDisplayOption = {
  shortLabel: string;
  longLabel: string;
  backgroundColor: string;
  detailBackgroundColor?: string; // if this is not set, backgroundColor will be used
  detailTextColor?: string; // if this is not set, textColor will be used
  textColor: string;
  dottedBorder?: boolean;
};

export const TYPE_DISPLAY_OPTIONS: {
  [type: string]: TypeDisplayOption;
} = {
  review: {
    shortLabel: 'R',
    longLabel: 'Review',
    backgroundColor: '#1E2F48',
    textColor: '#D4E5FF',
  },
  preprint: {
    shortLabel: 'P',
    longLabel: 'Preprint',
    backgroundColor: '#077A12',
    textColor: '#CBFFD0',
  },
  'evaluation-summary': {
    shortLabel: 'ES',
    longLabel: 'Evaluation Summary',
    backgroundColor: '#936308',
    textColor: '#FFF1D8',
  },
  'review-article': {
    shortLabel: 'RA',
    longLabel: 'Review Article',
    backgroundColor: '#099CEE',
    textColor: '#E7F6FF',
  },
  'journal-article': {
    shortLabel: 'JA',
    longLabel: 'Journal Article',
    backgroundColor: '#880052',
    textColor: '#FFE3F4',
  },
  editorial: {
    shortLabel: 'ED',
    longLabel: 'Editorial',
    backgroundColor: '#2A8781',
    textColor: '#E8FFFE',
  },
  comment: {
    shortLabel: 'CO',
    longLabel: 'Comment',
    backgroundColor: '#B66248',
    textColor: '#FFF0EB',
  },
  reply: {
    shortLabel: 'RE',
    longLabel: 'Reply',
    backgroundColor: '#79109E',
    textColor: '#F9E9FF',
  },
  '??': {
    shortLabel: '',
    longLabel: 'Type unknown',
    backgroundColor: '#CDCDCD',
    textColor: '#043945',
    detailBackgroundColor: '#777',
    detailTextColor: '#CDCDCD',
    dottedBorder: true,
  },
};

export const ALL_KNOWN_TYPES: string[] = Object.keys(TYPE_DISPLAY_OPTIONS);

// The fields of DisplayObject that are shown in the UI
export interface DisplayObjectMetadata {
  doi?: string;
  id?: string;
  published?: string;
  url?: URL;
  content?: string[];
  actors?: string;
}

// The following 3 statements allow us to use FieldsToDisplay both as a type and as something we can
// check against at runtime. We could also use io-ts for this, but that felt like overkill since this
// is the only place in the widget where we do something like this.
export type DisplayObjectMetadataField = keyof DisplayObjectMetadata;
const DisplayObjectMetadataPrototype: { [K in DisplayObjectMetadataField]: null } = {
  doi: null,
  id: null,
  published: null,
  url: null,
  content: null,
  actors: null,
};

export function isDisplayObjectMetadataField(key: string): key is DisplayObjectMetadataField {
  return key in DisplayObjectMetadataPrototype;
}

export function displayObjectMetadataFieldNames(): DisplayObjectMetadataField[] {
  return Object.keys(DisplayObjectMetadataPrototype) as DisplayObjectMetadataField[];
}

// DisplayObjects are the widget's internal representation of a node from the graph view.
// They roughly correspond to a ThingT in the Docmap spec, but with only the fields that we want to display.
export interface DisplayObject extends DisplayObjectMetadata {
  nodeId: string; // Used internally to construct graph relationships, never rendered
  type: string;
}

// Removes undefined values so the DisplayObject can be merged with another DisplayObject via destructuring
// and puts the fields in the order in which they should be displayed
export function normalizeDisplayObject(displayObject: DisplayObject): DisplayObject {
  const { nodeId, type, doi, id, published, url, content, actors } = displayObject;
  return {
    nodeId,
    type,
    ...(doi && { doi }),
    ...(id && { id }),
    ...(published && { published }),
    ...(url && { url }),
    ...(content && { content }),
    ...(actors && { actors }),
  };
}

export function mergeDisplayObjects(a: DisplayObject | undefined, b: DisplayObject): DisplayObject {
  return {
    ...(a && normalizeDisplayObject(a)),
    ...normalizeDisplayObject(b),
  };
}

// DisplayObjectEdges are the widget's internal representation of an edge connecting two DisplayObjects.
export type DisplayObjectEdge = {
  sourceId: string;
  targetId: string;
};

export type DisplayObjectGraph = {
  nodes: DisplayObject[];
  edges: DisplayObjectEdge[];
};
