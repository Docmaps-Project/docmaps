import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { logoSmall } from './assets';
import { Task } from '@lit/task';
import { DocmapFetchingParams, docmapToDisplayObjectGraph, getDocmap } from './docmap-controller';
import { DisplayObject, DisplayObjectGraph, GRAPH_CANVAS_ID } from './display-object';
import { clearGraph, displayGraph, noDocmapFoundScreen } from './graph-view';
import { renderDetailsView } from './detail-view';
import { loadFont } from './font';

@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  // The @state decorator is used to automatically trigger a re-render when the value changes
  @state()
  selectedNode?: DisplayObject; // if this is set, we're showing the detail view

  @state()
  graph?: DisplayObjectGraph;

  @state()
  detailTooltip: { text: string; x: number; y: number } = {
    text: '',
    x: 0,
    y: 0,
  };

  // We keep track of this because we have to render once before drawing the graph
  // so that D3 has a canvas to draw into.
  #hasRenderedOnce: boolean = false;

  set docmap(docmap: any) {
    this.configureWithDocmap(docmap);
  }

  #docmapFetchingTask: Task<DocmapFetchingParams, DisplayObjectGraph> = new Task(
    this,
    getDocmap,
    (): DocmapFetchingParams => [this.serverUrl, this.doi],
  );

  static styles = [customCss];

  firstUpdated() {
    loadFont();
    this.#hasRenderedOnce = true;
  }

  private showDetailViewForNode = (node: DisplayObject) => {
    this.selectedNode = node;
  };

  // Method to clear the selected node and go back to the graph view
  private closeDetailView = () => {
    this.selectedNode = undefined;
  };

  private updateDetailTooltip = (newText: string, x: number, y: number) => {
    // Show the tooltip with the provided text and position
    this.detailTooltip = {
      text: newText,
      x: x,
      y: y,
    };

    // Set a timeout to hide the tooltip after 3 seconds
    setTimeout(() => (this.detailTooltip = { ...this.detailTooltip, text: '' }), 2000);
  };

  render(): HTMLTemplateResult {
    const d3Canvas: HTMLTemplateResult = html` <div id="${GRAPH_CANVAS_ID}"></div>`;
    const content = this.selectedNode ? this.detailView() : this.graphView();

    return html`
      <div class="docmaps-widget">
        <div class="widget-header">
          ${logoSmall}
          <span>DOCMAP</span>
        </div>
        ${d3Canvas} ${content}
        <div id="graph-tooltip" class="tooltip" style="opacity:0;"></div>
        ${this.renderDetailTooltip()}
      </div>
    `;
  }

  private renderDetailTooltip() {
    const { text, x, y } = this.detailTooltip;
    return html`
      <div
        id="detail-tooltip"
        class="tooltip"
        style="opacity: ${text ? 1 : 0}; left: ${x}px; top: ${y}px; visibility: ${text
          ? 'visible'
          : 'hidden'}"
      >
        ${text}
      </div>
    `;
  }

  private configureWithDocmap(docmap: any) {
    this.graph = docmapToDisplayObjectGraph(docmap);
  }

  private renderGraphView({ nodes, edges }: DisplayObjectGraph) {
    if (this.shadowRoot) {
      displayGraph(nodes, edges, this.shadowRoot, this.showDetailViewForNode);
    }
  }

  onFetchComplete = (graph: DisplayObjectGraph) => {
    this.graph = graph;
    this.renderGraphView(graph);
    // D3 draws in the canvas for us, so we do not return html representing the graph
    return nothing;
  };

  private graphView() {
    if (this.graph) {
      if (this.#hasRenderedOnce) {
        // There is a canvas for D3 to draw in! We can render the graph now
        this.renderGraphView(this.graph);
      }
    } else {
      return html` ${this.#docmapFetchingTask?.render({
        complete: this.onFetchComplete,
        error: (e) => noDocmapFoundScreen(e, this.doi),
      })}`;
    }

    return nothing;
  }

  private detailView() {
    clearGraph(this.shadowRoot);
    if (!this.selectedNode) {
      return nothing;
    }

    if (!this.graph) {
      return nothing;
    }

    return renderDetailsView(
      this.selectedNode,
      this.graph.nodes,
      this.showDetailViewForNode,
      this.closeDetailView,
      this.updateDetailTooltip,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
