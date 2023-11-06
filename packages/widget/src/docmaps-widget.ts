import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { customCss } from './styles';
import { logo } from './assets/logo';
import * as d3 from 'd3';
import { SimulationLinkDatum } from 'd3';
import { Task } from '@lit/task';
import {
  DisplayObject,
  DisplayObjectEdge,
  DisplayObjectGraph,
  DocmapFetchingParams,
  getDocmap,
} from './docmap-controller';
import { SimulationNodeDatum } from 'd3-force';
import * as Dagre from 'dagre';

export type D3Node = SimulationNodeDatum & DisplayObject;
export type D3Edge = SimulationLinkDatum<D3Node>;

const WIDGET_SIZE: number = 500;
const GRAPH_CANVAS_HEIGHT: number = 475;
const GRAPH_CANVAS_ID: string = 'd3-canvas';
const FIRST_NODE_RADIUS: number = 50;
const NODE_RADIUS: number = 37.5;
const RANK_SEPARATION: number = 100;

type TypeDisplayOption = {
  shortLabel: string;
  longLabel: string;
  backgroundColor: string;
  textColor: string;
};

const typeDisplayOpts: { [type: string]: TypeDisplayOption } = {
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
    backgroundColor: '#868f8f',
    textColor: '#FFF',
  },
};

// TODO name should be singular not plural
@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  @property({ type: Number })
  count: number = 3;

  #docmapFetchingTask: Task<DocmapFetchingParams, DisplayObjectGraph> = new Task(
    this,
    getDocmap,
    (): DocmapFetchingParams => [this.serverUrl, this.doi],
  );

  static styles = [customCss];

  render() {
    return html`
      <div class="widget-header">
        ${logo}
        <span>DOCMAP</span>
      </div>

      <div
        id="${GRAPH_CANVAS_ID}"
        style="width: ${WIDGET_SIZE}; height: ${GRAPH_CANVAS_HEIGHT}"
      ></div>

      <div id="tooltip" class="tooltip" style="opacity:0;"></div>

      ${this.#docmapFetchingTask.render({
        complete: this.renderDocmap.bind(this),
      })}
    `;
  }

  private renderDocmap({ nodes, edges }: DisplayObjectGraph) {
    this.drawGraph(nodes, edges);
    // D3 draws the graph for us within the GRAPH_CANVAS_ID div, so we have nothing to actually render here
    return nothing;
  }

  private drawGraph(nodes: DisplayObject[], edges: DisplayObjectEdge[]) {
    if (!this.shadowRoot) {
      return;
    }

    d3.select(this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID} svg`)).remove();
    const canvas = this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID}`);
    if (!canvas) {
      throw new Error('SVG element not found');
    }

    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('width', WIDGET_SIZE)
      .attr('height', GRAPH_CANVAS_HEIGHT);

    // We use dagre to calculate the initial layout of the graph
    const dagreGraph: Dagre.graphlib.Graph<DisplayObject> = getDagreGraph(nodes, edges);
    const displayNodes: D3Node[] = dagreGraph.nodes().map((nodeId) => {
      const node = dagreGraph.node(nodeId);
      return {
        ...node,
        // We fix the nodes' vertical position to whatever dagre decided, but not the horizontal position since we want some nice easing into the final position
        fy: node.y,
      };
    });
    const displayEdges: D3Edge[] = edges.map(
      (edge): D3Edge => ({ source: edge.sourceId, target: edge.targetId }),
    );

    const simulation: d3.Simulation<D3Node, D3Edge> = d3
      .forceSimulation(displayNodes)
      .force(
        'link',
        d3
          .forceLink(displayEdges)
          .id((d: d3.SimulationNodeDatum) => {
            // @ts-ignore
            return d.nodeId;
          })
          .distance(RANK_SEPARATION * 1.7)
          .strength(0.2),
      )
      .force('charge', d3.forceManyBody())
      .force('collide', d3.forceCollide(FIRST_NODE_RADIUS))
      .force(
        'center',
        d3.forceCenter(Math.floor(WIDGET_SIZE / 2), Math.floor(GRAPH_CANVAS_HEIGHT / 2)),
      );

    const linkElements = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(displayEdges)
      .enter()
      .append('line')
      .attr('stroke', 'black')
      .attr('class', 'link');

    const nodeElements = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(displayNodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('fill', (d) => typeDisplayOpts[d.type].backgroundColor)
      .attr('r', (d, i) => (i === 0 ? FIRST_NODE_RADIUS : NODE_RADIUS));

    const labels = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(displayNodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', (d) => typeDisplayOpts[d.type].textColor) // Set the text color
      .text((d) => typeDisplayOpts[d.type].shortLabel);

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as D3Node).x ?? 0)
        .attr('y1', (d) => (d.source as D3Node).y ?? 0)
        .attr('x2', (d) => (d.target as D3Node).x ?? 0)
        .attr('y2', (d) => (d.target as D3Node).y ?? 0);

      nodeElements.attr('cx', getNodeX).attr('cy', getNodeY);
      labels
        .attr('x', (d: D3Node) => getNodeX(d) + 0.8) // We offset slightly because otherwise the label looks very slightly off-center horizontally
        .attr('y', getNodeY);
    });

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
          .html(() => typeDisplayOpts[d.type].longLabel)
          .style('visibility', 'visible')
          .style('opacity', 1)
          .style('left', `${event.pageX + 5}px`) // Position the tooltip at the mouse location
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden').style('opacity', 0);
      });
  }
}

// One limitation of using Dagre is we have no control over the ordering of nodes within the same rank.
function getDagreGraph(
  nodes: DisplayObject[],
  edges: DisplayObjectEdge[],
): Dagre.graphlib.Graph<DisplayObject> {
  const g: Dagre.graphlib.Graph<DisplayObject> = new Dagre.graphlib.Graph();

  g.setGraph({
    nodesep: 50,
    marginy: 100,
    marginx: 30,
    ranksep: RANK_SEPARATION,
    width: WIDGET_SIZE,
    height: GRAPH_CANVAS_HEIGHT,
  });

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {};
  });

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

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}

const getNodeX = (d: D3Node) => d.x ?? 0;
const getNodeY = (d: D3Node) => d.y ?? 0;
