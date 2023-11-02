import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { customCss } from './styles';
import { logo } from './assets/logo';
import * as d3 from 'd3';
import { SimulationLinkDatum } from 'd3';
import { Task } from '@lit/task';
import { getDocmap } from './docmap-controller';
import { SimulationNodeDatum } from 'd3-force';

export type Node = SimulationNodeDatum & { id: string };
export type Link = SimulationLinkDatum<Node>;

const WIDGET_SIZE: number = 500;
const GRAPH_CANVAS_HEIGHT: number = 375;
const GRAPH_CANVAS_ID: string = 'd3-canvas';
const NODE_RADIUS: number = 20;

@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  @property({ type: Number })
  count: number = 3;

  #docmapFetchingTask: Task<[string, string], string> = new Task(
    this,
    getDocmap,
    (): [string, string] => [this.serverUrl, this.doi],
  );

  nodes: Node[] = [
    { id: 'N1', x: 100, y: 150 },
    { id: 'N2', x: 300, y: 150 },
    { id: 'N3', x: 200, y: 300 },
  ];

  links: Link[] = [
    { source: 'N1', target: 'N2' },
    { source: 'N2', target: 'N3' },
    { source: 'N3', target: 'N1' },
  ];

  static styles = [customCss];

  private _onClick() {
    this.count++;

    // Create a new node with a unique ID
    const newNode: Node = {
      id: 'N' + this.count,
      x: Math.random() * 215,
      y: Math.random() * 175,
    };

    // Connect the new node to a random existing node
    const targetNode =
      this.nodes[Math.floor(Math.random() * this.nodes.length)];
    this.links.push({ source: newNode.id, target: targetNode.id });

    // Order matters here. We add the node to this.nodes after selecting our targetNode so the
    // new node doesn't get linked to itself.
    this.nodes.push(newNode);

    // Re-render the graph
    this.drawGraph();
  }

  private drawGraph() {
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

    // Make copy of Nodes and Links because d3 mutates whatever Nodes/Links we pass it
    const displayNodes: Node[] = JSON.parse(JSON.stringify(this.nodes));
    const displayLinks: Link[] = JSON.parse(JSON.stringify(this.links));

    const simulation: d3.Simulation<Node, Link> = d3
      .forceSimulation(displayNodes)
      .force(
        'link',
        d3.forceLink(displayLinks).id((d: d3.SimulationNodeDatum) => {
          // @ts-ignore
          return d.id;
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
      .data(displayLinks)
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
      .text((d) => d.id);

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as Node).x ?? 0)
        .attr('y1', (d) => (d.source as Node).y ?? 0)
        .attr('x2', (d) => (d.target as Node).x ?? 0)
        .attr('y2', (d) => (d.target as Node).y ?? 0);

      nodeElements.attr('cx', getNodeX).attr('cy', getNodeY);

      labels.attr('x', getNodeX).attr('y', getNodeY);
    });
  }

  firstUpdated() {
    this.drawGraph();
  }

  render() {
    return html`
      <div class="widget-header">
        ${logo}
        <span>DOCMAP</span>
      </div>

      <h2>${this.doi}</h2>
      ${this.#docmapFetchingTask.render({
        complete: (id) => html`Docmap ID: ${id}`,
      })}

      <div
        id="${GRAPH_CANVAS_ID}"
        style="width: ${WIDGET_SIZE}; height: ${GRAPH_CANVAS_HEIGHT}"
      ></div>

      <div class="card">
        <button @click="${this._onClick}" part="button">
          Add ${this.count + 1}th node
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}

const getNodeX = (d: Node) => d.x ?? 0;
const getNodeY = (d: Node) => d.y ?? 0;
