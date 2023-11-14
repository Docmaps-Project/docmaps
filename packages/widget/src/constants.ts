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

export const TYPE_DISPLAY_OPTIONS: { [type: string]: TypeDisplayOption } = {
  review: {
    shortLabel: 'R',
    longLabel: 'Review',
    backgroundColor: '#222F46',
    textColor: '#D7E4FD',
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
    textColor: '#FFF',
  },
  'review-article': {
    shortLabel: 'RA',
    longLabel: 'Review Article',
    backgroundColor: '#099CEE',
    textColor: '#FFF',
  },
  'journal-article': {
    shortLabel: 'JA',
    longLabel: 'Journal Article',
    backgroundColor: '#7B1650',
    textColor: '#FFF',
  },
  editorial: {
    shortLabel: 'ED',
    longLabel: 'Editorial',
    backgroundColor: '#468580',
    textColor: '#FFFFFF',
  },
  comment: {
    shortLabel: 'CO',
    longLabel: 'Comment',
    backgroundColor: '#AB664E',
    textColor: '#FFF',
  },
  reply: {
    shortLabel: 'RE',
    longLabel: 'Reply',
    backgroundColor: '#79109E',
    textColor: '#FFF',
  },
  '??': {
    shortLabel: '',
    longLabel: 'Type unknown',
    backgroundColor: '#EFEFEF',
    textColor: '#043945',
    detailBackgroundColor: "#777",
    detailTextColor: "#EFEFEF",
    dottedBorder: true,
  },
};

export const ALL_KNOWN_TYPES: string[] = Object.keys(TYPE_DISPLAY_OPTIONS);

// Each input and output of the Docmap's steps is converted into one of these
export interface DisplayObject {
  nodeId: string; // Used internally to construct graph, never rendered
  type: string;
  doi?: string;
  id?: string;
  published?: string;
  url?: URL;
  content?: string[];
  actors?: string;
}

// String names of the DisplayObject fields that we want to display
export const DOCMAP_FIELDS_TO_DISPLAY = ['doi', 'id', 'published', 'url', 'content', 'actors'];

export type DisplayObjectEdge = {
  sourceId: string;
  targetId: string;
};

export type DisplayObjectGraph = {
  nodes: DisplayObject[];
  edges: DisplayObjectEdge[];
};
