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

export type D3Node = SimulationNodeDatum & DisplayObject;
export type D3Edge = SimulationLinkDatum<D3Node>;

const WIDGET_SIZE: number = 500;
const GRAPH_CANVAS_HEIGHT: number = 375;
const GRAPH_CANVAS_ID: string = 'd3-canvas';
const NODE_RADIUS: number = 20;

const typeToLabel: { [type: string]: string } = {
  review: 'R',
  preprint: 'P',
  'evaluation-summary': 'ES',
  'review-article': 'RA',
  'journal-article': 'JA',
  editorial: 'ED',
  comment: 'CO',
  reply: 'RE',
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

  #docmapFetchingTask: Task<DocmapFetchingParams, DisplayObjectGraph> =
    new Task(
      this,
      getDocmap,
      (): DocmapFetchingParams => [this.serverUrl, this.doi],
    );

  // nodes: Node[] = [
  //   { id: 'N1', x: 100, y: 150 },
  //   { id: 'N2', x: 300, y: 150 },
  //   { id: 'N3', x: 200, y: 300 },
  // ];
  //
  // links: Link[] = [
  //   { source: 'N1', target: 'N2' },
  //   { source: 'N2', target: 'N3' },
  //   { source: 'N3', target: 'N1' },
  // ];

  static styles = [customCss];

  // private _onClick() {
  //   this.count++;
  //
  //   // Create a new node with a unique ID
  //   const newNode: Node = {
  //     id: 'N' + this.count,
  //     x: Math.random() * 215,
  //     y: Math.random() * 175,
  //   };
  //
  //   // Connect the new node to a random existing node
  //   const targetNode =
  //     this.nodes[Math.floor(Math.random() * this.nodes.length)];
  //   this.links.push({ source: newNode.id, target: targetNode.id });
  //
  //   // Order matters here. We add the node to this.nodes after selecting our targetNode so the
  //   // new node doesn't get linked to itself.
  //   this.nodes.push(newNode);
  //
  //   // Re-render the graph
  //   this.drawGraph();
  // }

  // firstUpdated() {
  //   this.drawGraph();
  // }

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

    d3.select(
      this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID} svg`),
    ).remove();
    const canvas = this.shadowRoot.querySelector(`#${GRAPH_CANVAS_ID}`);
    if (!canvas) {
      throw new Error('SVG element not found');
    }

    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('width', WIDGET_SIZE)
      .attr('height', GRAPH_CANVAS_HEIGHT);

    const displayNodes: D3Node[] = nodes.map((node) => ({ ...node }));
    const displayEdges: D3Edge[] = edges.map(
      (edge): D3Edge => ({ source: edge.sourceId, target: edge.targetId }),
    );
    console.log(JSON.stringify(displayNodes));
    console.log(JSON.stringify(displayEdges));

    const simulation: d3.Simulation<D3Node, D3Edge> = d3
      .forceSimulation(displayNodes)
      .force(
        'link',
        d3.forceLink(displayEdges).id((d: d3.SimulationNodeDatum) => {
          // @ts-ignore
          return d.nodeId;
        }),
      )
      .force('charge', d3.forceManyBody())
      .force('collide', d3.forceCollide(NODE_RADIUS * 1.5))
      .force(
        'center',
        d3.forceCenter(
          Math.floor(WIDGET_SIZE / 2),
          Math.floor(GRAPH_CANVAS_HEIGHT / 2),
        ),
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
      .attr('fill', 'green')
      .attr('r', NODE_RADIUS);

    const labels = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(displayNodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em') // Vertically center
      .attr('fill', 'white')
      .text((d) => typeToLabel[d.type]);

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as D3Node).x ?? 0)
        .attr('y1', (d) => (d.source as D3Node).y ?? 0)
        .attr('x2', (d) => (d.target as D3Node).x ?? 0)
        .attr('y2', (d) => (d.target as D3Node).y ?? 0);

      nodeElements.attr('cx', getNodeX).attr('cy', getNodeY);

      labels.attr('x', getNodeX).attr('y', getNodeY);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}

const getNodeX = (d: D3Node) => d.x ?? 0;
const getNodeY = (d: D3Node) => d.y ?? 0;
