import { html, HTMLTemplateResult } from 'lit';
import { DisplayObject, filterMetadataEntries, TYPE_DISPLAY_OPTIONS } from './util';
import { renderDetailNavigationHeader } from './detail-navigation-header';
import { closeDetailsButton } from './assets';

export function renderDetailsView(
  selectedNode: DisplayObject,
  allNodes: DisplayObject[],
  updateSelectedNode: (node: DisplayObject) => void,
  closeDetailsView: () => void,
) {
  const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
  const metadataEntries: [string, any][] = filterMetadataEntries(selectedNode);

  const metadataBody: HTMLTemplateResult =
    metadataEntries.length > 0 ? createMetadataGrid(metadataEntries) : emptyMetadataMessage();

  const backgroundColor = opts.detailBackgroundColor || opts.backgroundColor;
  const textColor = opts.detailTextColor || opts.textColor;

  return html`
    <div class="detail-timeline">
      ${renderDetailNavigationHeader(allNodes, selectedNode, updateSelectedNode)}
    </div>

    <div class="detail-header" style="background: ${backgroundColor};">
      <span style="color: ${textColor};"> ${opts.longLabel} </span>
      <div class="close-button clickable" @click="${closeDetailsView}">
        ${closeDetailsButton(textColor)}
      </div>
    </div>

    <div class="detail-body">${metadataBody}</div>
  `;
}

const createMetadataGrid = (metadataEntries: [string, any][]): HTMLTemplateResult => {
  const gridItems: HTMLTemplateResult[] = metadataEntries.map(([key, value], index) =>
    createGridItem(key, value, index),
  );
  return html` <div class="metadata-grid">${gridItems}</div>`;
};

const createGridItem = (key: string, value: any, index: number): HTMLTemplateResult => {
  let keyDisplay: HTMLTemplateResult = html` <div class="metadata-grid-item key">${key}</div>`;
  if (Array.isArray(value)) {
    const start = index + 1;
    const end = index + value.length + 1;
    keyDisplay = html` <div
      class="metadata-grid-item key"
      style="grid-row-start: ${start}; grid-row-end: ${end};"
    >
      ${key}
    </div>`;
  }

  let valueDisplay: HTMLTemplateResult;
  if (key === 'url') {
    valueDisplay = html`<a
      href="${value}"
      target="_blank"
      class="metadata-grid-item value metadata-link"
      >${value}</a
    >`;
  } else if (key === 'content' && Array.isArray(value)) {
    valueDisplay = html`${value.map(
      (val) =>
        html` <a
          href="${val}"
          target="_blank"
          class="metadata-grid-item value content metadata-link"
          >${val}</a
        >`,
    )}`;
  } else if (Array.isArray(value)) {
    valueDisplay = html`${value.map(
      (val) => html` <div class="metadata-grid-item value content">${val}</div>`,
    )}`;
  } else {
    valueDisplay = html` <div class="metadata-grid-item value">${value}</div>`;
  }

  return html` ${keyDisplay} ${valueDisplay} `;
};

const emptyMetadataMessage = (): HTMLTemplateResult => {
  return html` <div class="metadata-item">
    <div class="metadata-key">no metadata found</div>
  </div>`;
};
