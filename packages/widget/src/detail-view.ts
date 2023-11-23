import { html, HTMLTemplateResult } from 'lit';
import {
  DisplayObject,
  isDisplayObjectMetadataField,
  normalizeDisplayObject,
  TYPE_DISPLAY_OPTIONS,
} from './util';
import { renderDetailNavigationHeader } from './detail-navigation-header';
import { closeDetailsButton } from './assets';

export function renderDetailsView(
  selectedNode: DisplayObject,
  allNodes: DisplayObject[],
  updateSelectedNode: (node: DisplayObject) => void,
  closeDetailsView: () => void,
) {
  const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
  const backgroundColor = opts.detailViewBackgroundColor || opts.backgroundColor;
  const textColor = opts.detailViewTextColor || opts.textColor;

  const fieldsToDisplay: [string, any][] = getMetadataFieldsToDisplay(selectedNode);
  const detailBody: HTMLTemplateResult =
    fieldsToDisplay.length > 0 ? createMetadataGrid(fieldsToDisplay) : emptyMetadataMessage();

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

    <div class="detail-body">${detailBody}</div>
  `;
}

const createMetadataGrid = (metadataEntries: [string, any][]): HTMLTemplateResult => {
  const gridItems: HTMLTemplateResult[] = metadataEntries.map(([key, value], index) =>
    createGridItem(key, value, index),
  );
  return html` <div class="metadata-grid">${gridItems}</div>`;
};

function displayMetadataKey(key: string, value: any, index: number): HTMLTemplateResult {
  if (Array.isArray(value)) {
    // This key has multiple values, so we need to span multiple rows
    const start = index + 1;
    const end = index + value.length + 1;
    return html` <div
      class="metadata-grid-item key"
      style="grid-row-start: ${start}; grid-row-end: ${end};"
    >
      ${key}
    </div>`;
  }
  return html` <div class="metadata-grid-item key">${key}</div>`;
}

function displayMetadataValue(key: string, value: any): HTMLTemplateResult {
  if (key === 'url') {
    // display as clickable link
    return html` <a href="${value}" target="_blank" class="metadata-grid-item value metadata-link">
      ${value}
    </a>`;
  }

  if (key === 'content' && Array.isArray(value)) {
    // display as list of clickable links
    return html` ${value.map(
      (val) =>
        html` <a
          href="${val}"
          target="_blank"
          class="metadata-grid-item value content metadata-link"
        >
          ${val}
        </a>`,
    )}`;
  }

  if (Array.isArray(value)) {
    // display as list
    return html`${value.map(
      (val) => html` <div class="metadata-grid-item value content">${val}</div>`,
    )}`;
  }

  // Display as single value
  return html` <div class="metadata-grid-item value">${value}</div>`;
}

const createGridItem = (key: string, value: any, index: number): HTMLTemplateResult => {
  return html` ${displayMetadataKey(key, value, index)} ${displayMetadataValue(key, value)} `;
};

const emptyMetadataMessage = (): HTMLTemplateResult => {
  return html` <div class="metadata-item">
    <div class="metadata-key">no metadata found</div>
  </div>`;
};

const getMetadataFieldsToDisplay = (node: DisplayObject): [string, any][] => {
  // first put the fields in order:
  const normalizedNode = normalizeDisplayObject(node);

  // then keep only the fields that should be displayed:
  return Object.entries(normalizedNode).filter(
    ([key, value]) => isDisplayObjectMetadataField(key) && value,
  );
};
