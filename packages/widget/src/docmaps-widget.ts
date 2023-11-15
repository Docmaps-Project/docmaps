import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { closeDetailsButton, logo, timelinePlaceholder } from './assets';
import * as d3 from 'd3';
import { SimulationLinkDatum } from 'd3';
import { Task } from '@lit/task';
import { DocmapFetchingParams, getDocmap } from './docmap-controller';
import { SimulationNodeDatum } from 'd3-force';
import * as Dagre from 'dagre';
import {
  DisplayObject,
  DisplayObjectEdge,
  DisplayObjectGraph,
  FIRST_NODE_RADIUS,
  GRAPH_CANVAS_HEIGHT,
  GRAPH_CANVAS_ID,
  isFieldToDisplay,
  NODE_RADIUS,
  RANK_SEPARATION,
  TYPE_DISPLAY_OPTIONS,
  WIDGET_SIZE,
} from './constants';

export type D3Node = SimulationNodeDatum & DisplayObject & { x: number; y: number }; // We override x & y since they're optional in SimulationNodeDatum, but not in our use case
export type D3Edge = SimulationLinkDatum<D3Node>;

// TODO name should be singular not plural
@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  @state()
  selectedNode?: DisplayObject;

  #docmapFetchingTask: Task<DocmapFetchingParams, DisplayObjectGraph> = new Task(
    this,
    getDocmap,
    (): DocmapFetchingParams => [this.serverUrl, this.doi],
  );

  static styles = [customCss];

  render() {
    const content = this.selectedNode
      ? this.renderDetailsView(this.selectedNode)
      : html` <div id="tooltip" class="tooltip" style="opacity:0;"></div>

          ${this.#docmapFetchingTask.render({
            complete: this.renderDocmap.bind(this),
          })}`;

    return html`
      <div class="widget-header">
        ${logo}
        <span>DOCMAP</span>
      </div>

      <div id="${GRAPH_CANVAS_ID}"></div>

      ${content}
    `;
  }

  private onNodeClick(node: DisplayObject) {
    this.selectedNode = node;
    this.requestUpdate(); // Trigger re-render
  }

  private renderDocmap({ nodes, edges }: DisplayObjectGraph) {
    this.drawGraph(nodes, edges);
    // D3 draws the graph for us within the GRAPH_CANVAS_ID div, so we have nothing to actually render here
    return nothing;
  }

  private drawGraph(nodes: DisplayObject[], edges: DisplayObjectEdge[]) {
    if (!this.shadowRoot) {
      // We cannot draw a graph if we aren't able to find the place we want to draw it
      return;
    }

    this.clearGraph();

    const canvas = this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID}`);
    if (!canvas) {
      throw new Error('SVG element not found');
    }

    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('width', WIDGET_SIZE)
      .attr('height', GRAPH_CANVAS_HEIGHT);

    const { d3Nodes, d3Edges, graphWidth } = prepareGraphForSimulation(nodes, edges);

    if (graphWidth) {
      svg.attr('viewBox', `0 0 ${graphWidth} ${GRAPH_CANVAS_HEIGHT}`);
    }

    const simulation: d3.Simulation<D3Node, D3Edge> = d3
      .forceSimulation(d3Nodes)
      .force(
        'link',
        d3
          .forceLink(d3Edges)
          .id((d: d3.SimulationNodeDatum) => {
            // @ts-ignore
            return d.nodeId;
          })
          .distance(RANK_SEPARATION * 1.2)
          .strength(0.2),
      )
      .force('charge', d3.forceManyBody())
      .force('collide', d3.forceCollide(NODE_RADIUS * 1.3))
      .force(
        'center',
        d3.forceCenter(Math.floor(graphWidth / 2), Math.floor(GRAPH_CANVAS_HEIGHT / 2)),
      );

    const linkElements = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Edges)
      .enter()
      .append('line')
      .attr('stroke', 'black')
      .attr('class', 'link');

    const nodeElements = svg
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

    const labels = svg
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

    nodeElements.on('click', (_event, d) => this.onNodeClick(d));
    labels.on('click', (_event, d) => this.onNodeClick(d));

    this.setUpTooltips(nodeElements);
    this.setUpTooltips(labels);
  }

  private clearGraph() {
    if (!this.shadowRoot) {
      return;
    }
    d3.select(this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID} svg`)).remove();
  }

  private setUpTooltips(selection: d3.Selection<any, D3Node, SVGGElement, unknown>) {
    if (!this.shadowRoot) {
      return;
    }
    const tooltip = d3.select(this.shadowRoot.querySelector('#tooltip'));

    selection
      .on('mouseover', function (event, d) {
        tooltip
          .html(() => TYPE_DISPLAY_OPTIONS[d.type].longLabel)
          .style('visibility', 'visible')
          .style('opacity', 1)
          .style('left', `${event.pageX + 5}px`) // Position the tooltip at the mouse location
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden').style('opacity', 0);
      });
  }

  private renderDetailsView(node: DisplayObject): HTMLTemplateResult {
    this.clearGraph();
    const opts = TYPE_DISPLAY_OPTIONS[node.type];
    const metadataEntries = this.filterMetadataEntries(node);

    const metadataBody =
      metadataEntries.length > 0
        ? this.createMetadataGrid(metadataEntries)
        : this.emptyMetadataMessage();

    const backgroundColor = opts.detailBackgroundColor
      ? opts.detailBackgroundColor
      : opts.backgroundColor;

    const textColor = opts.detailTextColor ? opts.detailTextColor : opts.textColor;
    return html`
      <div class="detail-timeline">${timelinePlaceholder}</div>

      <div class="detail-header" style="background: ${backgroundColor};">
        <span style="color: ${textColor};"> ${opts.longLabel} </span>
        <div class="close-button clickable" @click="${this.closeDetailsView}">
          ${closeDetailsButton(textColor)}
        </div>
      </div>

      <div class="detail-body">${metadataBody}</div>
    `;
  }

  private filterMetadataEntries(node: DisplayObject): [string, any][] {
    return Object.entries(node).filter(([key, value]) => isFieldToDisplay(key) && value);
  }

  private createMetadataGrid(metadataEntries: [string, any][]): HTMLTemplateResult {
    const gridItems = metadataEntries.map((entry, index) => this.createGridItem(entry, index));
    return html` <div class="metadata-grid">${gridItems}</div>`;
  }

  private createGridItem([key, value]: [string, any], index: number): HTMLTemplateResult {
    if (Array.isArray(value)) {
      const values: any[] = value; // rename since it's actually plural
      return html`
        <div
          class="metadata-grid-item key"
          style="grid-row-start: ${index + 1}; grid-row-end: ${index + values.length + 1};"
        >
          ${key}
        </div>
        ${values.map((val) => html` <div class="metadata-grid-item value content">${val}</div>`)}
      `;
    }

    return html`
      <div class="metadata-grid-item key">${key}</div>
      <div class="metadata-grid-item value">${value}</div>
    `;
  }

  private emptyMetadataMessage(): HTMLTemplateResult {
    return html` <div class="metadata-item">
      <div class="metadata-key">no metadata found</div>
    </div>`;
  }

  // Method to clear the selected node and go back to the graph
  private closeDetailsView() {
    this.selectedNode = undefined;
    this.requestUpdate(); // Trigger re-render
  }
}

type DagreGraph = Dagre.graphlib.Graph<DisplayObject>;

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

  for (const edge of edges) {
    g.setEdge(edge.sourceId, edge.targetId);
  }
  Dagre.layout(g);

  return g;
}

function groupNodesByYCoordinate(nodeIds: string[], dagreGraph: DagreGraph) {
  const yLevelNodeMap = new Map<number, D3Node[]>();
  nodeIds.forEach((nodeId) => {
    const node = dagreGraph.node(nodeId);
    const yLevel = node.y;

    // Initialize the array for this y level if it doesn't exist yet
    if (!yLevelNodeMap.has(yLevel)) {
      yLevelNodeMap.set(yLevel, []);
    }

    yLevelNodeMap.get(yLevel)?.push(node);
  });
  return yLevelNodeMap;
}

// Convert the naive "DisplayObject" nodes and edges we get from the Docmap controller
// into nodes and edges that are ready to render via d3
//
// Along the way, we also calculate initial positions for the nodes.
function prepareGraphForSimulation(
  nodes: DisplayObject[],
  edges: DisplayObjectEdge[],
): { d3Edges: D3Edge[]; d3Nodes: D3Node[]; graphWidth: number } {
  const dagreGraph: DagreGraph = getInitialNodePositions(nodes, edges);

  const graphBounds = dagreGraph.graph();
  let graphWidth = WIDGET_SIZE;
  if (
    graphBounds.width &&
    graphBounds.height &&
    (graphBounds.width > WIDGET_SIZE || graphBounds.height > GRAPH_CANVAS_HEIGHT)
  ) {
    const aspectRatio = (1.1 * graphBounds.width) / graphBounds.height;
    graphWidth = aspectRatio * GRAPH_CANVAS_HEIGHT;
  }

  const nodeIds: string[] = dagreGraph.nodes();

  // Group nodes by their y position
  // So we can determine later if a node is the only one on its level
  const yLevelNodeMap = groupNodesByYCoordinate(nodeIds, dagreGraph);

  const displayNodes: D3Node[] = nodeIds.map((nodeId) => {
    const node = dagreGraph.node(nodeId);
    const nodesOnThisLevel = yLevelNodeMap.get(node.y);
    const isOnlyNodeOnLevel = nodesOnThisLevel && nodesOnThisLevel.length === 1;

    return {
      ...node,
      // We fix the nodes' vertical position to whatever dagre decided to maintain the hierarchy
      fy: node.y,

      // Fix the x coordinate to the center if it's the only node on this level
      ...(isOnlyNodeOnLevel ? { fx: Math.floor(graphWidth / 2) } : {}),
    };
  });

  const displayEdges: D3Edge[] = edges.map(
    (e: DisplayObjectEdge): D3Edge => ({ source: e.sourceId, target: e.targetId }),
  );

  return { d3Nodes: displayNodes, d3Edges: displayEdges, graphWidth };
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}

const getNodeX = (d: D3Node) => d.x ?? 0;
const getNodeY = (d: D3Node) => d.y ?? 0;
