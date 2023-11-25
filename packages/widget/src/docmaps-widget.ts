import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { logo } from './assets';
import { Task } from '@lit/task';
import { DocmapFetchingParams, docmapToDisplayObjectGraph, getDocmap } from './docmap-controller';
import { DisplayObject, DisplayObjectGraph, GRAPH_CANVAS_ID } from './display-object';
import { clearGraph, displayGraph } from './graph-view';
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
  private closeDetailView() {
    this.selectedNode = undefined;
  }

  render(): HTMLTemplateResult {
    const d3Canvas: HTMLTemplateResult = html` <div id="${GRAPH_CANVAS_ID}"></div>`;
    const content = this.selectedNode ? this.detailView() : this.graphView();

    return html`
      <div class="docmaps-widget">
        <div class="widget-header">
          ${logo}
          <span>DOCMAP</span>
        </div>
        ${d3Canvas} ${content}
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
        this.renderGraphView(this.graph);
      }
    } else {
      this.#docmapFetchingTask?.render({
        complete: this.onFetchComplete,
      });
    }

    return html` <div id="tooltip" class="tooltip" style="opacity:0;"></div>`;
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
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget;
  }
}
