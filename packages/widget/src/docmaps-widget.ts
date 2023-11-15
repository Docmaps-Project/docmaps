import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { closeDetailsButton, logo, timelinePlaceholder } from './assets';
import * as d3 from 'd3';
import { Task } from '@lit/task';
import { DocmapFetchingParams, getDocmap } from './docmap-controller';
import * as Dagre from 'dagre';
import {
  D3Edge,
  D3Node,
  DagreGraph,
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

  firstUpdated() {
    loadFont();
  }

  render(): HTMLTemplateResult {
    let content: HTMLTemplateResult;
    if (this.selectedNode) {
      content = this.renderDetailsView(this.selectedNode);
    } else {
      content = html`
        <div id='tooltip' class='tooltip' style='opacity:0;'></div>
        ${this.#docmapFetchingTask.render({ complete: this.renderDocmap.bind(this) })}`;
    }

    return html`
      <div class="widget-header">
        ${logo}
        <span>DOCMAP</span>
      </div>

      <div id="${GRAPH_CANVAS_ID}"></div>

      ${content}
    `;
  }

  private renderDocmap({ nodes, edges }: DisplayObjectGraph) {
    if (this.shadowRoot) {
      const { d3Nodes, d3Edges, graphWidth } = prepareGraphForSimulation(nodes, edges);

      const canvas: Element | null = this.getCanvasElement();
      const svg = this.createEmptySvgForGraph(canvas, graphWidth);
      this.drawGraph(d3Nodes, d3Edges, graphWidth, svg);
    }

    // D3 draws the graph for us, so we have nothing to actually render here
    return nothing;
  }

  private drawGraph(
    d3Nodes: D3Node[],
    d3Edges: D3Edge[],
    graphWidth: number,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ) {
    const simulation = createForceSimulation(d3Nodes, d3Edges, graphWidth);
    const linkElements = createLinkElements(svg, d3Edges);
    const nodeElements = createNodeElements(svg, d3Nodes);
    const labels = createLabels(svg, d3Nodes);
    setupSimulationTicks(simulation, linkElements, nodeElements, labels);
    this.setupInteractivity(nodeElements, labels);
  }

  private onNodeClick(node: DisplayObject) {
    this.selectedNode = node;
    this.requestUpdate(); // Trigger re-render
  }

  private createEmptySvgForGraph(
    canvas: Element | null,
    graphWidth: number,
  ): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    this.clearGraph();
    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('width', WIDGET_SIZE)
      .attr('height', GRAPH_CANVAS_HEIGHT);

    if (graphWidth) {
      svg.attr('viewBox', `0 0 ${graphWidth} ${GRAPH_CANVAS_HEIGHT}`);
    }
    return svg;
  }

  private clearGraph() {
    if (!this.shadowRoot) {
      return;
    }

    d3.select(this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID} svg`)).remove();
  }

  private getCanvasElement(): Element | null {
    if (!this.shadowRoot) {
      return null;
    }

    const canvas = this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID}`);
    if (!canvas) {
      throw new Error('SVG element not found');
    }
    return canvas;
  }

  private setupInteractivity(
    nodeElements: d3.Selection<SVGCircleElement, D3Node, SVGGElement, unknown>,
    labels: d3.Selection<SVGTextElement, D3Node, SVGGElement, unknown>,
  ) {
    nodeElements.on('click', (_event, d: D3Node) => this.onNodeClick(d));
    labels.on('click', (_event, d: D3Node) => this.onNodeClick(d));

    this.setUpTooltips(nodeElements);
    this.setUpTooltips(labels);
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
    const metadataEntries: [string, any][] = this.filterMetadataEntries(node);

    const metadataBody: HTMLTemplateResult =
      metadataEntries.length > 0
        ? this.createMetadataGrid(metadataEntries)
        : this.emptyMetadataMessage();

    const backgroundColor = opts.detailBackgroundColor || opts.backgroundColor;
    const textColor = opts.detailTextColor || opts.textColor;

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

  // Method to clear the selected node and go back to the graph
  private closeDetailsView() {
    this.selectedNode = undefined;
    this.requestUpdate(); // Trigger re-render
  }

  private filterMetadataEntries(node: DisplayObject): [string, any][] {
    return Object.entries(node).filter(([key, value]) => isFieldToDisplay(key) && value);
  }

  private createMetadataGrid(metadataEntries: [string, any][]): HTMLTemplateResult {
    const gridItems: HTMLTemplateResult[] = metadataEntries.map((entry, index) =>
      this.createGridItem(entry, index),
    );
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
}

function createLabels(
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

function createNodeElements(
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

function createLinkElements(
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

function createForceSimulation(d3Nodes: D3Node[], d3Edges: D3Edge[], graphWidth: number) {
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

function setupSimulationTicks(
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
function prepareGraphForSimulation(
  nodes: DisplayObject[],
  edges: DisplayObjectEdge[],
): { d3Edges: D3Edge[]; d3Nodes: D3Node[]; graphWidth: number } {
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
  const d3Nodes: D3Node[] = transformDisplayObjectsToD3Nodes(dagreGraph, yLevelNodeMap, graphWidth);

  // Transform DisplayObjectEdges into edges that D3 can use
  const d3Edges: D3Edge[] = edges.map(
    (e: DisplayObjectEdge): D3Edge => ({ source: e.sourceId, target: e.targetId }),
  );

  return { d3Nodes, d3Edges, graphWidth };
}

function transformDisplayObjectsToD3Nodes(
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
      // Always maintain vertical position from Dagre
      fy: node.y,
      // Fix center horizontally if node is alone on its level. Otherwise, let d3 decide the x position.
      ...(isOnlyNodeOnLevel ? { fx: Math.floor(graphWidth / 2) } : {}),
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

function loadFont() {
  // Load IBM Plex Mono font
  // It would be nice to do this in styles.ts, but `@import` is not supported there.
  addLinkToDocumentHeader('preconnect', 'https://fonts.googleapis.com');
  addLinkToDocumentHeader('preconnect', 'https://fonts.gstatic.com', 'anonymous');
  addLinkToDocumentHeader(
    'stylesheet',
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap',
  );
}

function addLinkToDocumentHeader(rel: string, href: string, crossorigin?: string) {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }
  document.head.appendChild(link);
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}

const getNodeX = (d: D3Node) => d.x ?? 0;
const getNodeY = (d: D3Node) => d.y ?? 0;
