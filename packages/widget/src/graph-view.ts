import * as d3 from 'd3';
import { SimulationLinkDatum } from 'd3';
import {
  DisplayObject,
  DisplayObjectEdge,
  FIRST_NODE_RADIUS,
  GRAPH_CANVAS_HEIGHT,
  GRAPH_CANVAS_ID,
  NODE_RADIUS,
  RANK_SEPARATION,
  TYPE_DISPLAY_OPTIONS,
  WIDGET_SIZE,
} from './display-object';
import * as Dagre from 'dagre';
import { SimulationNodeDatum } from 'd3-force';
import { html } from 'lit';
import { logoLarge } from './assets';

// D3Nodes represent a node that is being passed to D3's force simulation to be rendered in the graph view.
// They are a superset of DisplayObjects, with additional fields that are used by D3.
// Note that we override x & y since they're optional in SimulationNodeDatum, but not in our use case
type D3Node = SimulationNodeDatum &
  DisplayObject & {
    x: number;
    y: number;
  };
type D3Edge = SimulationLinkDatum<D3Node>; // an edge between two D3Nodes
type DagreGraph = Dagre.graphlib.Graph<DisplayObject>;

export const displayGraph = (
  nodes: DisplayObject[],
  edges: DisplayObjectEdge[],
  shadowRoot: ShadowRoot | null,
  onNodeClick: (node: DisplayObject) => void,
) => {
  const { d3Nodes, d3Edges, graphWidth } = prepareGraphForSimulation(nodes, edges);

  const canvas: Element | null = getCanvasElement(shadowRoot);
  const svg = createEmptySvgForGraph(canvas, graphWidth, shadowRoot);
  drawGraph(d3Nodes, d3Edges, graphWidth, svg, shadowRoot, onNodeClick);
};

export function noDocmapFoundScreen(e: unknown, doi: string) {
  console.log('Error fetching docmap:\n\n', e);
  return html`
    <div class="not-found-screen">
      <div class="not-found-message">
        <p>No data found for DOI</p>
        <p>${doi}</p>
      </div>

      ${logoLarge}
    </div>
  `;
}

export function createLabels(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  d3Nodes: D3Node[],
) {
  return svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(d3Nodes)
    .enter()
    .append('text')
    .attr('class', 'label clickable')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', (d) => TYPE_DISPLAY_OPTIONS[d.type].textColor) // Set the text color
    .text((d) => TYPE_DISPLAY_OPTIONS[d.type].shortLabel);
}

export function createNodeElements(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  d3Nodes: D3Node[],
) {
  return svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(d3Nodes)
    .enter()
    .append('circle')
    .attr('class', 'node clickable')
    .attr('fill', (d) => TYPE_DISPLAY_OPTIONS[d.type].backgroundColor)
    .attr('r', (_, i: number): number => (i === 0 ? FIRST_NODE_RADIUS : NODE_RADIUS))
    .attr('stroke', (d: D3Node): string =>
      TYPE_DISPLAY_OPTIONS[d.type].dottedBorder ? '#777' : 'none',
    )
    .attr('stroke-width', (d: D3Node): string =>
      TYPE_DISPLAY_OPTIONS[d.type].dottedBorder ? '2px' : 'none',
    )
    .attr('stroke-dasharray', (d: D3Node): string =>
      TYPE_DISPLAY_OPTIONS[d.type].dottedBorder ? '8 4' : 'none',
    );
}

export function createLinkElements(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  d3Edges: D3Edge[],
): d3.Selection<SVGLineElement, D3Edge, SVGGElement, unknown> {
  return svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(d3Edges)
    .enter()
    .append('line')
    .attr('stroke', 'black')
    .attr('class', 'link');
}

export function createForceSimulation(d3Nodes: D3Node[], d3Edges: D3Edge[], graphWidth: number) {
  return d3
    .forceSimulation(d3Nodes)
    .force(
      'link',
      d3
        .forceLink(d3Edges)
        .id((d: d3.SimulationNodeDatum) => {
          // @ts-ignore
          return d.nodeId;
        })
        .distance(RANK_SEPARATION * 1.3)
        .strength(0.2),
    )
    .force('charge', d3.forceManyBody())
    .force('collide', d3.forceCollide(NODE_RADIUS * 1.3))
    .force(
      'center',
      d3.forceCenter(Math.floor(graphWidth / 2), Math.floor(GRAPH_CANVAS_HEIGHT / 2)),
    );
}

export function setupSimulationTicks(
  simulation: d3.Simulation<D3Node, D3Edge>,
  linkElements: d3.Selection<SVGLineElement, D3Edge, SVGGElement, unknown>,
  nodeElements: d3.Selection<SVGCircleElement, D3Node, SVGGElement, unknown>,
  labels: d3.Selection<SVGTextElement, D3Node, SVGGElement, unknown>,
) {
  simulation.on('tick', () => {
    linkElements
      .attr('x1', (d) => (d.source as D3Node).x ?? 0)
      .attr('y1', (d) => (d.source as D3Node).y ?? 0)
      .attr('x2', (d) => (d.target as D3Node).x ?? 0)
      .attr('y2', (d) => (d.target as D3Node).y ?? 0);

    nodeElements.attr('cx', getNodeX).attr('cy', getNodeY);
    labels
      // We offset x slightly because otherwise the label looks a tiny bit off-center horizontally
      .attr('x', (d: D3Node) => getNodeX(d) + 0.8)
      .attr('y', getNodeY);
  });
}

// Dagre is a tool for laying out directed graphs. We use it to generate initial positions for
// our nodes, which we then pass to d3 to animate into their final positions.
function getInitialNodePositions(nodes: DisplayObject[], edges: DisplayObjectEdge[]): DagreGraph {
  const g: DagreGraph = new Dagre.graphlib.Graph();

  g.setGraph({
    nodesep: 50,
    marginy: 70,
    marginx: 30,
    ranksep: RANK_SEPARATION,
    width: WIDGET_SIZE,
    height: GRAPH_CANVAS_HEIGHT,
  });

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}));

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const size = i === 0 ? FIRST_NODE_RADIUS : NODE_RADIUS;
    g.setNode(node.nodeId, { ...node, width: size, height: size });
  }

  edges.forEach((edge) => g.setEdge(edge.sourceId, edge.targetId));
  Dagre.layout(g);

  return g;
}

function groupNodesByYCoordinate(nodeIds: string[], dagreGraph: DagreGraph): Map<number, D3Node[]> {
  const yLevelNodeMap: Map<number, D3Node[]> = new Map<number, D3Node[]>();
  nodeIds.forEach((nodeId: string) => {
    const node: Dagre.Node<DisplayObject> = dagreGraph.node(nodeId);
    const yLevel: number = node.y;

    if (!yLevelNodeMap.has(yLevel)) {
      yLevelNodeMap.set(yLevel, []);
    }

    yLevelNodeMap.get(yLevel)?.push(node);
  });
  return yLevelNodeMap;
}

// Convert the naive "DisplayObject" nodes and edges we get from the Docmap controller
// into nodes and edges that are ready to render via d3
// Along the way, we also calculate initial positions for the nodes.
export function prepareGraphForSimulation(
  nodes: DisplayObject[],
  edges: DisplayObjectEdge[],
): {
  d3Edges: D3Edge[];
  d3Nodes: D3Node[];
  graphWidth: number;
} {
  // Use Dagre to get initial node positions based on graph layout
  const dagreGraph: DagreGraph = getInitialNodePositions(nodes, edges);

  // If the graph is too big to fit in the widget, we will need to zoom out
  const { width, height }: Dagre.GraphLabel = dagreGraph.graph();
  let graphWidth: number = WIDGET_SIZE;
  if (width && height && graphIsTooBigForCanvas(width, height)) {
    graphWidth = calculateGraphWidth(width, height);
  }

  // Group nodes by their y position for level-based processing
  const yLevelNodeMap: Map<number, D3Node[]> = groupNodesByYCoordinate(
    dagreGraph.nodes(),
    dagreGraph,
  );

  // Transform DisplayObjects into D3Nodes with fixed positions as per Dagre layout
  const d3Nodes: D3Node[] = createD3Nodes(dagreGraph, yLevelNodeMap, graphWidth);

  // Transform DisplayObjectEdges into edges that D3 can use
  const d3Edges: D3Edge[] = edges.map(
    (e: DisplayObjectEdge): D3Edge => ({ source: e.sourceId, target: e.targetId }),
  );

  return { d3Nodes, d3Edges, graphWidth };
}

function createD3Nodes(
  dagreGraph: Dagre.graphlib.Graph<DisplayObject>,
  yLevelNodeMap: Map<number, D3Node[]>,
  graphWidth: number,
) {
  return dagreGraph.nodes().map((nodeId) => {
    const node: Dagre.Node<DisplayObject> = dagreGraph.node(nodeId);
    const nodesOnThisLevel: D3Node[] | undefined = yLevelNodeMap.get(node.y);
    const isOnlyNodeOnLevel: boolean = nodesOnThisLevel?.length === 1;

    return {
      ...node,
      // Maintain vertical position from Dagre
      fy: node.y,
      // Fix the node at horizontal center if it is alone on its y-level
      ...(isOnlyNodeOnLevel && { fx: Math.floor(graphWidth / 2) }),
    };
  });
}

function graphIsTooBigForCanvas(width: number, height: number): boolean {
  return width > WIDGET_SIZE || height > GRAPH_CANVAS_HEIGHT;
}

function calculateGraphWidth(width: number, height: number) {
  const aspectRatio: number = (1.1 * width) / height;
  return aspectRatio * GRAPH_CANVAS_HEIGHT;
}

export const clearGraph = (shadowRoot: ShadowRoot | null) => {
  if (!shadowRoot) {
    return;
  }

  d3.select(shadowRoot.querySelector(`#${GRAPH_CANVAS_ID} svg`)).remove();
};

const getNodeX = (d: D3Node) => d.x ?? 0;
const getNodeY = (d: D3Node) => d.y ?? 0;

export const setUpTooltips = (
  selection: d3.Selection<any, D3Node, SVGGElement, unknown>,
  shadowRoot: ShadowRoot | null,
) => {
  if (!shadowRoot) {
    return;
  }

  const tooltip = d3.select(shadowRoot.querySelector('#graph-tooltip'));

  selection
    .on('mouseover', function (event, d) {
      tooltip
        .html(() => TYPE_DISPLAY_OPTIONS[d.type].longLabel)
        .style('visibility', 'visible')
        .style('opacity', 1)
        .style('left', `${event.pageX}px`) // Position the tooltip at the mouse location
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden').style('opacity', 0);
    });
};

export const setupInteractivity = (
  nodeElements: d3.Selection<SVGCircleElement, D3Node, SVGGElement, unknown>,
  labels: d3.Selection<SVGTextElement, D3Node, SVGGElement, unknown>,
  shadowRoot: ShadowRoot | null,
  onNodeClick: (node: DisplayObject) => void,
) => {
  if (!shadowRoot) {
    return;
  }

  const tooltip = d3.select(shadowRoot.querySelector('#graph-tooltip'));

  nodeElements.on('click', (_event, d: D3Node) => {
    // Hide the tooltip first
    tooltip.style('visibility', 'hidden').style('opacity', 0);

    // Then handle the node click
    onNodeClick(d);
  });

  labels.on('click', (_event, d: D3Node) => {
    // Hide the tooltip first
    tooltip.style('visibility', 'hidden').style('opacity', 0);

    // Then handle the node click
    onNodeClick(d);
  });

  setUpTooltips(nodeElements, shadowRoot);
  setUpTooltips(labels, shadowRoot);
};

export const drawGraph = (
  d3Nodes: D3Node[],
  d3Edges: D3Edge[],
  graphWidth: number,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  shadowRoot: ShadowRoot | null,
  onNodeClick: (node: DisplayObject) => void,
) => {
  const simulation = createForceSimulation(d3Nodes, d3Edges, graphWidth);
  const linkElements = createLinkElements(svg, d3Edges);
  const nodeElements = createNodeElements(svg, d3Nodes);
  const labels = createLabels(svg, d3Nodes);
  setupSimulationTicks(simulation, linkElements, nodeElements, labels);
  setupInteractivity(nodeElements, labels, shadowRoot, onNodeClick);
};

export const createEmptySvgForGraph = (
  canvas: Element | null,
  graphWidth: number,
  shadowRoot: ShadowRoot | null,
): d3.Selection<SVGSVGElement, unknown, null, undefined> => {
  clearGraph(shadowRoot);
  const svg = d3
    .select(canvas)
    .append('svg')
    .attr('width', WIDGET_SIZE)
    .attr('height', GRAPH_CANVAS_HEIGHT);

  if (graphWidth) {
    svg.attr('viewBox', `0 0 ${graphWidth} ${GRAPH_CANVAS_HEIGHT}`);
  }
  return svg;
};

export const getCanvasElement = (shadowRoot: ShadowRoot | null): Element | null => {
  if (!shadowRoot) {
    return null;
  }

  const canvas = shadowRoot.querySelector(`#${GRAPH_CANVAS_ID}`);
  if (!canvas) {
    throw new Error('SVG element not found');
  }
  return canvas;
};
