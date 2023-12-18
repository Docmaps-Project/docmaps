import { html, HTMLTemplateResult } from 'lit';
import {
  DisplayObject,
  isDisplayObjectMetadataField,
  normalizeDisplayObject,
  TYPE_DISPLAY_OPTIONS,
} from './display-object.ts';
import { renderDetailNavigationHeader } from './detail-navigation-header';
import { closeDetailsButton, copyToClipboardButton } from './assets';

type MetadataKey = string;
type MetadataValue = string | string[];
type MetadataTuple = [MetadataKey, MetadataValue];

export function renderDetailsView(
  selectedNode: DisplayObject,
  allNodes: DisplayObject[],
  updateSelectedNode: (node: DisplayObject) => void,
  closeDetailsView: () => void,
  updateDetailTooltip: (newText: string, x: number, y: number) => void,
): HTMLTemplateResult {
  const opts = TYPE_DISPLAY_OPTIONS[selectedNode.type];
  const backgroundColor = opts.detailViewBackgroundColor || opts.backgroundColor;
  const textColor = opts.detailViewTextColor || opts.textColor;

  const fieldsToDisplay: MetadataTuple[] = getMetadataFieldsToDisplay(selectedNode);
  const detailBody: HTMLTemplateResult =
    fieldsToDisplay.length > 0
      ? renderMetadataGrid(fieldsToDisplay, updateDetailTooltip)
      : emptyMetadataMessage();

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

// Renders the metadata grid, which is a 2-column grid of key-value pairs.
// The key is displayed in the left column, and the value is displayed in the right column. If the value is an array, it
// is displayed as multiple rows, with the key cell spanning all those rows.
const renderMetadataGrid = (
  metadataEntries: [MetadataKey, MetadataValue][],
  updateDetailTooltip: (newText: string, x: number, y: number) => void,
): HTMLTemplateResult => {
  const gridItems: HTMLTemplateResult[] = metadataEntries.map(([key, value], index) =>
    createGridItem(key, value, index, updateDetailTooltip),
  );
  return html` <div class="metadata-grid">${gridItems}</div>`;
};

function renderMetadataKey(
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

function displayMetadataValue(
  key: MetadataKey,
  value: MetadataValue,
  updateDetailTooltip: (newText: string, x: number, y: number) => void,
): HTMLTemplateResult {
  if (key === 'url' && typeof value === 'string') {
    // display as clickable link
    const template = html` <a href="${value}" target="_blank" class="metadata-link">${value}</a>`;
    return copyableMetadataValue(template, value, updateDetailTooltip);
  }

  if (Array.isArray(value)) {
    // Display as a list of clickable links.
    return html` ${value.map((val) => {
      const template = html` <a href="${val}" target="_blank" class="content metadata-link"
        >${val}</a
      >`;
      return copyableMetadataValue(template, val, updateDetailTooltip);
    })}`;
  }

  // Display as single value
  return copyableMetadataValue(html` <span>${value}</span>`, value, updateDetailTooltip);
}

function copyableMetadataValue(
  template: HTMLTemplateResult,
  value: string,
  onCopy: (newText: string, x: number, y: number) => void,
): HTMLTemplateResult {
  return html`
    <div class="metadata-grid-item value">${template} ${copyToClipboardButton(value, onCopy)}</div>
  `;
}

const createGridItem = (
  key: MetadataKey,
  value: MetadataValue,
  index: number,
  updateDetailTooltip: (newText: string, x: number, y: number) => void,
): HTMLTemplateResult => {
  return html`
    ${renderMetadataKey(key, value, index)} ${displayMetadataValue(key, value, updateDetailTooltip)}
  `;
};

const emptyMetadataMessage = (): HTMLTemplateResult => {
  return html` <div class="no-metadata-found-grid">
    <div class="metadata-grid-item">no metadata found</div>
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
