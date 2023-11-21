import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { customCss } from './styles';
import { logo } from './assets';
import { Task } from '@lit/task';
import { DocmapFetchingParams, getDocmap } from './docmap-controller';
import { DisplayObject, DisplayObjectGraph, GRAPH_CANVAS_ID } from './util';
import { clearGraph, displayGraph } from './graph-view';
import { renderDetailsView } from './detail-view';
import { loadFont } from './font';

@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  @property({ type: String })
  doi: string = '';

  @property({ type: String })
  serverUrl: string = '';

  @state() // This decorator automatically causes a rerender when the selecetdNode changes
  selectedNode?: DisplayObject; // if this is set, we're showing the detail view

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

  private graphView() {
    const onFetchComplete = ({ nodes, edges }: DisplayObjectGraph) => {
      if (this.shadowRoot) {
        this.allNodes = nodes;
        displayGraph(nodes, edges, this.shadowRoot, this.showDetailViewForNode);
      }

      return nothing; // D3 draws the graph for us, so we have nothing to actually render here
    };

    // this function usually returns a template result, but we don't need it currently since d3 draws the graph for us
    this.#docmapFetchingTask.render({
      complete: onFetchComplete,
    });

    return html` <div id="tooltip" class="tooltip" style="opacity:0;"></div>`;
  }

  private detailView() {
    clearGraph(this.shadowRoot);
    if (!this.selectedNode) {
      return nothing;
    }

    return renderDetailsView(
      this.selectedNode,
      this.allNodes,
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
