import { SimulationLinkDatum } from 'd3';
import { SimulationNodeDatum } from 'd3-force';
import * as Dagre from 'dagre';

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
    textColor: '#FFEDCC',
  },
  'review-article': {
    shortLabel: 'RA',
    longLabel: 'Review Article',
    backgroundColor: '#099CEE',
    textColor: '#CEEDFF',
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
    textColor: '#F6DBFF',
  },
  '??': {
    shortLabel: '',
    longLabel: 'Type unknown',
    backgroundColor: '#EFEFEF',
    textColor: '#043945',
    detailBackgroundColor: '#777',
    detailTextColor: '#EFEFEF',
    dottedBorder: true,
  },
};

export const ALL_KNOWN_TYPES: string[] = Object.keys(TYPE_DISPLAY_OPTIONS);

export interface FieldsToDisplay {
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
export type FieldToDisplay = keyof FieldsToDisplay;

const FieldsToDisplayPrototype: { [K in FieldToDisplay]: null } = {
  doi: null,
  id: null,
  published: null,
  url: null,
  content: null,
  actors: null,
};

export function isFieldToDisplay(key: string): key is FieldToDisplay {
  return key in FieldsToDisplayPrototype;
}

export function getFieldsToDisplay(): FieldToDisplay[] {
  return Object.keys(FieldsToDisplayPrototype) as FieldToDisplay[];
}

// Each input and output of the Docmap's steps is converted into one of these
export interface DisplayObject extends FieldsToDisplay {
  nodeId: string; // Used internally to construct graph, never rendered
  type: string;
}

export type DisplayObjectEdge = {
  sourceId: string;
  targetId: string;
};

export type DisplayObjectGraph = {
  nodes: DisplayObject[];
  edges: DisplayObjectEdge[];
};

// We override x & y since they're optional in SimulationNodeDatum, but not in our use case
export type D3Node = SimulationNodeDatum & DisplayObject & { x: number; y: number };
export type D3Edge = SimulationLinkDatum<D3Node>;
export type DagreGraph = Dagre.graphlib.Graph<DisplayObject>;
