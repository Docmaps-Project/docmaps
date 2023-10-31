import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { customCss } from './styles'
import * as d3 from 'd3'

type Node = { x: number; y: number; id: string }
// Before our Link is rendered, we declare it as a connection between 2 Node ids
type DeclaredLink = { source: string; target: string }
// After our Link is rendered, D3 replaces the ids with references to the actual Nodes
type RenderedLink = { source: Node; target: Node }

const CANVAS_WIDTH: number = 500
const CANVAS_HEIGHT: number = 300
const CANVAS_ID: string = 'd3-canvas'
const NODE_RADIUS: number = 20

@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: Number })
  count = 3

  nodes: Node[] = [
    { id: 'N1', x: 100, y: 150 },
    { id: 'N2', x: 300, y: 150 },
    { id: 'N3', x: 200, y: 300 },
  ]

  links: DeclaredLink[] = [
    { source: 'N1', target: 'N2' },
    { source: 'N2', target: 'N3' },
    { source: 'N3', target: 'N1' },
  ]

  static styles = [customCss]

  private _onClick() {
    this.count++

    // Create a new node with a unique ID
    const newNode = { id: 'N' + this.count, x: Math.random() * 215, y: Math.random() * 175 }

    // Connect the new node to a random existing node
    const existingNode = this.nodes[Math.floor(Math.random() * this.nodes.length)]
    this.links.push({ source: newNode.id, target: existingNode.id })

    // Add the node after the link so the node isn't linked to itself
    this.nodes.push(newNode)

    // Re-render the graph
    this.drawGraph()
  }

  private drawGraph() {
    if (this.shadowRoot) {
      d3.select(this.shadowRoot.querySelector(`#${CANVAS_ID} svg`)).remove()
      const canvas = this.shadowRoot.querySelector(`#${CANVAS_ID}`)
      if (!canvas) {
        throw new Error('SVG element not found')
      }

      const svg = d3
        .select(canvas)
        .append('svg')
        .attr('width', CANVAS_WIDTH)
        .attr('height', CANVAS_HEIGHT)

      // d3's simulation mutates the Node and Link lists.
      // We make a copy here so our original lists aren't modified
      const displayNodes: Node[] = JSON.parse(JSON.stringify(this.nodes))

      // The type RenderedLink[] is technically a lie when we first copy this.links,
      // but becomes true once the graph is rendered and d3 gets its hands on our list
      const displayLinks: RenderedLink[] =JSON.parse(JSON.stringify(this.links))

      // Initialize force layout
      const simulation = d3
        .forceSimulation(displayNodes)
        .force(
          'link',
          d3.forceLink(displayLinks).id((d) => {
            // @ts-ignore
            return d.id
          }),
        )
        .force('charge', d3.forceManyBody())
        .force('collide', d3.forceCollide(NODE_RADIUS * 1.5))
        .force(
          'center',
          d3.forceCenter(Math.floor(CANVAS_WIDTH / 2), Math.floor(CANVAS_HEIGHT / 2)),
        )

      // Create link elements
      const linkElements = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(displayLinks)
        .enter()
        .append('line')
        .attr('stroke', 'white')
        .attr('class', 'link')

      // Create node elements
      const nodeElements = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(displayNodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('fill', 'green')
        .attr('r', NODE_RADIUS)

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
        .text((d) => d.id)

      // Update positions on each simulation tick
      simulation.on('tick', () => {
        linkElements
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)

        nodeElements.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
        labels.attr('x', (d) => d.x).attr('y', (d) => d.y)
      })
    }
  }

  firstUpdated() {
    this.drawGraph()
  }

  render() {
    return html`
      <h1>Docmaps</h1>

      <div id="${CANVAS_ID}" style="display: block;"></div>

      <div class="card">
        <button @click="${this._onClick}" part="button">Add ${this.count + 1}th node</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget
  }
}
