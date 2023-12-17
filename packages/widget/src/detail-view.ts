import { html, HTMLTemplateResult } from 'lit';
import {
  DisplayObject,
  isDisplayObjectMetadataField,
  normalizeDisplayObject,
  TYPE_DISPLAY_OPTIONS,
} from './display-object.ts';
import { renderDetailNavigationHeader } from './detail-navigation-header';
import { closeDetailsButton } from './assets';

type MetadataKey = string;
type MetadataValue = string | string[];
type MetadataTuple = [MetadataKey, MetadataValue];

export function renderDetailsView(
  selectedNode: DisplayObject,
  allNodes: DisplayObject[],
  updateSelectedNode: (node: DisplayObject) => void,
  closeDetailsView: () => void,
): HTMLTemplateResult {
  const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
  const backgroundColor = opts.detailViewBackgroundColor || opts.backgroundColor;
  const textColor = opts.detailViewTextColor || opts.textColor;

  const fieldsToDisplay: MetadataTuple[] = getMetadataFieldsToDisplay(selectedNode);
  const detailBody: HTMLTemplateResult =
    fieldsToDisplay.length > 0 ? createMetadataGrid(fieldsToDisplay) : emptyMetadataMessage();

  return html`
    <div class="detail-timeline no-select">
      ${renderDetailNavigationHeader(allNodes, selectedNode, updateSelectedNode)}
    </div>

    <div class="detail-header" style="background: ${backgroundColor};">
      <span style="color: ${textColor};" class="no-select">${opts.longLabel}</span>
      <div class="close-button clickable" @click="${closeDetailsView}">
        ${closeDetailsButton(textColor)}
      </div>
    </div>

    <div class="detail-body">${detailBody}</div>
  `;
}

const createMetadataGrid = (
  metadataEntries: [MetadataKey, MetadataValue][],
): HTMLTemplateResult => {
  const gridItems: HTMLTemplateResult[] = metadataEntries.map(([key, value], index) =>
    createGridItem(key, value, index),
  );
  return html` <div class="metadata-grid">${gridItems}</div>`;
};

function displayMetadataKey(
  key: MetadataKey,
  value: MetadataValue,
  index: number,
): HTMLTemplateResult {
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

function displayMetadataValue(key: MetadataKey, value: MetadataValue): HTMLTemplateResult {
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

  // This currently never happens, because the only field that can have multiple values is 'content', and we handle that
  // case above. But if we ever add another field that can have multiple values, this gives us a way to handle it.
  if (Array.isArray(value)) {
    // display as list
    return html`${value.map(
      (val) => html` <div class="metadata-grid-item value content">${val}</div>`,
    )}`;
  }

  // Display as single value
  return html` <div class="metadata-grid-item value">${value}</div>`;
}

const createGridItem = (
  key: MetadataKey,
  value: MetadataValue,
  index: number,
): HTMLTemplateResult => {
  return html` ${displayMetadataKey(key, value, index)} ${displayMetadataValue(key, value)} `;
};

const emptyMetadataMessage = (): HTMLTemplateResult => {
  return html` <div class="metadata-item">
    <div class="metadata-key">no metadata found</div>
  </div>`;
};

const getMetadataFieldsToDisplay = (node: DisplayObject): MetadataTuple[] => {
  // first put the fields in order:
  const normalizedNode = normalizeDisplayObject(node);

  // then keep only the fields that should be displayed:
  return Object.entries(normalizedNode)
    .filter(([key, value]) => isDisplayObjectMetadataField(key) && value)
    .filter(valueIsAStringOrStringArray);
};

// This type guard asserts that the tuple's value is a string or string array. We need to narrow this down so that we
// can handle "content" differently from other fields, making its key cell span multiple rows.
//
// It's worth noting that if we ever add a non-string or non-string-array field to DisplayObjectMetadata, this method
// will need to be updated, because right now it will filter those fields out and keep them from being displayed.
const valueIsAStringOrStringArray = (tuple: [string, any]): tuple is MetadataTuple => {
  const [_, value] = tuple;

  const isString = typeof value === 'string';
  const isStringArray = Array.isArray(value) && value.every((item) => typeof item === 'string');

  return isString || isStringArray;
};
