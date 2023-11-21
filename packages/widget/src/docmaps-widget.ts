import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { closeDetailsButton, logo } from './assets';
import { Task } from '@lit/task';
import { DocmapFetchingParams, getDocmap } from './docmap-controller';
import {
  DisplayObject,
  DisplayObjectGraph,
  filterMetadataEntries,
  GRAPH_CANVAS_ID,
  TYPE_DISPLAY_OPTIONS,
} from './util';
import { clearGraph, displayGraph } from './graph-view';
import { renderDetailNavigationHeader } from './detail-navigation-header';

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
        ${this.#docmapFetchingTask.render({ complete: this.renderGraphView.bind(this) })}`;
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

  private renderGraphView({ nodes, edges }: DisplayObjectGraph) {
    if (this.shadowRoot) {
      this.allNodes = nodes;
      displayGraph(nodes, edges, this.shadowRoot, this.displayNodeDetails);
    }

    // D3 draws the graph for us, so we have nothing to actually render here
    return nothing;
  }

  private displayNodeDetails = (node: DisplayObject) => {
    this.selectedNode = node;
    this.requestUpdate(); // Trigger re-render
  };

  private renderDetailsView(selectedNode: DisplayObject): HTMLTemplateResult {
    clearGraph(this.shadowRoot);
    const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
    const metadataEntries: [string, any][] = filterMetadataEntries(selectedNode);

    const metadataBody: HTMLTemplateResult =
      metadataEntries.length > 0
        ? this.createMetadataGrid(metadataEntries)
        : this.emptyMetadataMessage();

    const backgroundColor = opts.detailBackgroundColor || opts.backgroundColor;
    const textColor = opts.detailTextColor || opts.textColor;

    return html`
      <div class="detail-timeline">
        ${renderDetailNavigationHeader(this.allNodes, selectedNode, this.displayNodeDetails)}
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

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
