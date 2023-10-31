import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { customCss } from './styles';
import * as d3 from 'd3';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: Number })
  count = 3;

  nodes = [
    { id: 'A', x: 100, y: 150 },
    { id: 'B', x: 300, y: 150 },
    { id: 'C', x: 200, y: 300 },
  ];

  links = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' },
  ];

  static styles = [customCss];

  private _onClick() {
    this.count++;

    // Create a new node with a unique ID
    const newNode = { id: 'N' + this.count, x: Math.random() * 500, y: Math.random() * 300 };
    this.nodes.push(newNode);
    console.log(this.nodes)
    // Connect the new node to a random existing node
    const existingNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    this.links.push({ source: newNode.id, target: existingNode.id });
    // Re-render the graph
    this.drawGraph();
  }

  private drawGraph() {
    if (this.shadowRoot) {
      d3.select(this.shadowRoot.querySelector('#d3-canvas svg')).remove();
      const canvas = this.shadowRoot.querySelector('#d3-canvas');
      if (!canvas) {
        throw new Error('SVG element not found');
      }
      const svg = d3.select(canvas).append('svg').attr('width', 500).attr('height', 300);

      const displayNodes = JSON.parse(JSON.stringify(this.nodes));
      const displayLinks = JSON.parse(JSON.stringify(this.links));
      // Initialize force layout
      const simulation = d3
        .forceSimulation(displayNodes)
        .force(
          'link',
          d3.forceLink(displayLinks).id((d) => d.id),
        )
        .force('charge', d3.forceManyBody())
        .force('collide', d3.forceCollide(30)) // 25 is the radius for collision detection
        .force('center', d3.forceCenter(150, 150));

      // Create link elements
      const link = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(displayLinks)
        .enter()
        .append('line')
        .attr('stroke', 'white')
        .attr('class', 'link');

      // Create node elements
      const node = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(displayNodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('fill', 'green')
        .attr('r', 20);

      // Update positions on each simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      });
    }
  }

  firstUpdated() {
    this.drawGraph();
  }

  render() {
    return html`
      <h1>Docmaps</h1>

      <div id="d3-canvas" style="display: block;"></div>

      <div class="card">
        <button @click="${this._onClick}" part="button">count is ${this.count}</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
