import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { closeDetailsButton, logo, renderDetailNavigationHeader } from './assets';
import * as d3 from 'd3';
import { Task } from '@lit/task';
import { DocmapFetchingParams, getDocmap } from './docmap-controller';
import {
  D3Edge,
  D3Node,
  DisplayObject,
  DisplayObjectGraph,
  GRAPH_CANVAS_HEIGHT,
  GRAPH_CANVAS_ID,
  isFieldToDisplay,
  TYPE_DISPLAY_OPTIONS,
  WIDGET_SIZE,
} from './constants';
import {
  clearGraph,
  createForceSimulation,
  createLabels,
  createLinkElements,
  createNodeElements,
  prepareGraphForSimulation,
  setupSimulationTicks,
} from './graph-view';

@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  @state()
  selectedNode?: DisplayObject;

  @state()
  allNodes: DisplayObject[] = [];

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
      content = html` <div id="tooltip" class="tooltip" style="opacity:0;"></div>
        ${this.#docmapFetchingTask.render({ complete: this.renderDocmap.bind(this) })}`;
    }

    return html`
      <div class="docmaps-widget">
        <div class="widget-header">
          ${logo}
          <span>DOCMAP</span>
        </div>
        <div id="${GRAPH_CANVAS_ID}"></div>
        ${content}
      </div>
    `;
  }

  private renderDocmap({ nodes, edges }: DisplayObjectGraph) {
    if (this.shadowRoot) {
      this.allNodes = nodes;
      const { d3Nodes, d3Edges, graphWidth } = prepareGraphForSimulation(nodes, edges);

      const canvas: Element | null = this.getCanvasElement();
      const svg = this.createEmptySvgForGraph(canvas, graphWidth, this.shadowRoot);
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
    this.setupInteractivity(nodeElements, labels, this.shadowRoot);
  }

  private onNodeClick = (node: DisplayObject) => {
    this.selectedNode = node;
    this.requestUpdate(); // Trigger re-render
  };

  private createEmptySvgForGraph = (
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
    shadowRoot: ShadowRoot | null,
  ) {
    nodeElements.on('click', (_event, d: D3Node) => this.onNodeClick(d));
    labels.on('click', (_event, d: D3Node) => this.onNodeClick(d));

    setUpTooltips(nodeElements, shadowRoot);
    setUpTooltips(labels,shadowRoot);
  }


  private renderDetailsView(selectedNode: DisplayObject): HTMLTemplateResult {
    clearGraph(this.shadowRoot);
    const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
    const metadataEntries: [string, any][] = this.filterMetadataEntries(selectedNode);

    const metadataBody: HTMLTemplateResult =
      metadataEntries.length > 0
        ? this.createMetadataGrid(metadataEntries)
        : this.emptyMetadataMessage();

    const backgroundColor = opts.detailBackgroundColor || opts.backgroundColor;
    const textColor = opts.detailTextColor || opts.textColor;

    return html`
      <div class="detail-timeline">
        ${renderDetailNavigationHeader(this.allNodes, selectedNode, this.onNodeClick)}
      </div>

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

const setUpTooltips =(selection: d3.Selection<any, D3Node, SVGGElement, unknown>, shadowRoot: ShadowRoot | null) => {
  if (!shadowRoot) {
    return;
  }

  const tooltip = d3.select(shadowRoot.querySelector('#tooltip'));

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

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
