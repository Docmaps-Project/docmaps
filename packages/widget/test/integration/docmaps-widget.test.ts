import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web';
import { DocmapsWidget } from '../../src';
import { BrowserContext, Locator, Request, Route } from '@playwright/test';
import { JsonObject } from '@playwright/experimental-ct-core/types/component';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import fakeDocmapWithEveryType from '../fixtures/fake-docmap-with-every-thing-type';
import fakeDocmapWithTwoLonelyNodes from '../fixtures/fake-docmap-with-two-lonely-nodes';

const fixtures: { [docmapName: string]: { docmap: any; types: string[] } } = {
  docmapWithMultipleSteps: {
    docmap: docmapWithMultipleSteps,
    types: ['P', 'P', 'RA', 'RE', 'ES', 'RA'],
  },
  docmapWithOneStep: {
    docmap: docmapWithOneStep,
    types: ['', 'RA'],
  },
  anotherDocmapWithOneStep: {
    docmap: anotherDocmapWithOneStep,
    types: ['', 'RA', 'RA', 'RA'],
  },
  fakeDocmapWithEveryType: {
    docmap: fakeDocmapWithEveryType,
    types: ['P', 'P', 'RA', 'JA', 'R', 'RE', 'CO', 'ED', 'ES', ''],
  },
  fakeDocmapWithTwoLonelyNodes: {
    docmap: fakeDocmapWithTwoLonelyNodes,
    types: ['P', 'RA', 'RA', 'RA', '', 'JA'],
  },
};

test('The header bar is displayed in the graph view even if the requested docmap does not exist', async ({
  mount,
  context,
}) => {
  await mockDocmapForEndpoint(context, 'not-the-requested-doi', docmapWithOneStep);
  const widget: Locator = await mount(DocmapsWidget, {
    props: { ...defaultOptions.props, doi: 'the-requested-doi' },
  });
  await expect(widget.locator('.widget-header')).toContainText('DOCMAP');
});

[
  'docmapWithOneStep',
  'anotherDocmapWithOneStep',
  'docmapWithMultipleSteps',
  'fakeDocmapWithEveryType',
].forEach((docmapName) => {
  test(`It can display ${docmapName} as a graph`, async ({ mount, context }) => {
    const widget = await renderWidgetWithDocmap(
      docmapName,
      fixtures[docmapName].docmap,
      context,
      mount,
    );
    const expectedNodeLabels = fixtures[docmapName].types;

    await expect(widget.locator('circle')).toHaveCount(expectedNodeLabels.length);

    // all of our test cases have a single root node, meaning the first circle should be located
    // at the top of the widget, with all other nodes below it
    const firstCircle = widget.locator('circle').first();
    const firstCircleBoundingBox = await firstCircle.boundingBox();
    expect(firstCircleBoundingBox).toBeDefined();

    const secondCircle = widget.locator('circle').nth(1);
    const secondCircleBoundingBox = await secondCircle.boundingBox();
    expect(secondCircleBoundingBox).toBeDefined();
    expect(secondCircleBoundingBox.y).toBeGreaterThan(firstCircleBoundingBox.y);

    // assert the nodes are properly styled and labeled
    await expect(widget.locator('circle')).toHaveCount(expectedNodeLabels.length);
    await expect(widget.locator('text')).toHaveCount(expectedNodeLabels.length);
    for (let i = 0; i < expectedNodeLabels.length; i++) {
      const hasType = !!expectedNodeLabels[i];
      const expectedStroke: string = hasType ? 'none' : TYPE_UNKNOWN_DETAIL_HEADER_COLOR;
      const expectedStrokeWidth: string = hasType ? 'none' : '2px';
      const expectedStrokeDasharray: string = hasType ? 'none' : '8 4';
      const expectedBackgroundColor = typeShortLabelToOpts[expectedNodeLabels[i]].backgroundColor;
      const expectedTextColor = typeShortLabelToOpts[expectedNodeLabels[i]].textColor;

      const node = widget.locator('circle').nth(i);
      await expect(node).toHaveAttribute('fill', expectedBackgroundColor);
      await expect(node).toHaveAttribute('stroke', expectedStroke);
      await expect(node).toHaveAttribute('stroke-width', expectedStrokeWidth);
      await expect(node).toHaveAttribute('stroke-dasharray', expectedStrokeDasharray);

      const label = widget.locator('text').nth(i);
      await expect(label).toHaveText(expectedNodeLabels[i]);
      await expect(label).toHaveAttribute('fill', expectedTextColor);
    }
  });
});

test('Tooltips appear on mouseover', async ({ mount, context, browserName }) => {
  const widget = await renderWidgetWithDocmap(
    'tooltip-doi-test',
    docmapWithMultipleSteps,
    context,
    mount,
  );

  await assertTooltipAppearsOnHover(widget, widget.locator('.node').first(), 'Preprint');
  await assertTooltipAppearsOnHover(widget, widget.locator('.node').nth(3), 'Reply');

  if (browserName !== 'webkit') {
    // TODO for some reason this test fails on webkit even though the functionality does work on Safari.
    // This behavior is not important enough to spend time debugging right now.
    await assertTooltipAppearsOnHover(widget, widget.locator('.label').first(), 'Preprint');
    await assertTooltipAppearsOnHover(widget, widget.locator('.label').nth(3), 'Reply');
  }
});

test(`Can display details view for a Preprint with every field`, async ({ context, mount }) => {
  const docmapName = 'fakeDocmapWithTwoLonelyNodes';
  const docmap = fixtures[docmapName].docmap;
  const widget = await renderWidgetWithDocmap(
    'this-docmap-has-many-fields-in-one-thing-yo',
    docmap,
    context,
    mount,
  );

  const expectedNodeCount = fixtures[docmapName].types.length;
  await expect(widget.locator('.node')).toHaveCount(expectedNodeCount);
  const nodeToClick = widget.locator('.node').first();
  await nodeToClick.click({ force: true });

  await expect(widget.locator('.node')).toHaveCount(0);

  const detailsHeader = widget.locator('.detail-header');
  await expect(detailsHeader).toContainText('Preprint');
  await expect(detailsHeader).toHaveAttribute(
    'style',
    `background: ${typeShortLabelToOpts['P'].backgroundColor};`,
  );

  const keys = widget.locator('.metadata-grid-item.key');
  const vals = widget.locator('.metadata-grid-item.value');
  await expect(keys).toHaveCount(expectedNodeCount);
  await expect(vals).toHaveCount(expectedNodeCount + 1); // +1 for the second content item

  await expect(keys.nth(0)).toContainText('doi');
  await expect(vals.nth(0)).toContainText('10.1101/2022.11.08.000002');

  await expect(keys.nth(1)).toContainText('id');
  await expect(vals.nth(1)).toContainText('sick-preprint-bro');

  // day-of-week omitted because of timezone differences between local and CI environments
  // The widget doesn't actually handle this date conversion. It's done by the docmaps-sdk so we
  // should test it there.
  await expect(keys.nth(2)).toContainText('published');
  await expect(vals.nth(2)).toContainText('1993-10-');

  await expect(keys.nth(3)).toContainText('url');
  await expect(vals.nth(3)).toContainText('https://example.com/sick-preprint-yo');

  await expect(keys.nth(4)).toContainText('content');
  await expect(vals.nth(4)).toContainText('https://example.com/fake-journal/article/3003.png');
  await expect(vals.nth(5)).toContainText('https://example.com/fake-journal/article/3003.heic');

  await expect(keys.nth(5)).toContainText('actors');
  await expect(vals.nth(6)).toContainText('eve, Andrew Edstrom');

  // Assert the details display can be closed
  await widget.locator('.close-button').click({ force: true });
  await expect(widget.locator('.node')).toHaveCount(expectedNodeCount);
});

test('Can display details view for a Journal Article with different fields', async ({
  context,
  mount,
}) => {
  const widget = await renderWidgetWithDocmap(
    'this-is-a-journal-article',
    fakeDocmapWithTwoLonelyNodes,
    context,
    mount,
  );

  const opts = typeShortLabelToOpts['JA'];

  const nodeToClick = widget.locator('.node').nth(5);
  await nodeToClick.click({ force: true });

  await expect(widget.locator('.node')).toHaveCount(0);

  // Assert the details view is visible after the click
  const detailsHeader = widget.locator('.detail-header');
  await expect(detailsHeader).toContainText('Journal Article');
  await expect(detailsHeader).toHaveAttribute('style', `background: ${opts.backgroundColor};`);
  await expect(detailsHeader.locator('span')).toHaveAttribute('style', `color: ${opts.textColor};`);

  const keys = widget.locator('.metadata-grid-item.key');
  const vals = widget.locator('.metadata-grid-item.value');
  await expect(keys).toHaveCount(4);
  await expect(vals).toHaveCount(6);

  await expect(keys.nth(0)).toContainText('published');
  await expect(vals.nth(0)).toContainText('2023-01-23');

  await expect(keys.nth(1)).toContainText('url');
  await expect(vals.nth(1)).toContainText('https://example.com/fake-journal/article/3003');

  await expect(keys.nth(2)).toContainText('content');
  await expect(vals.nth(2)).toContainText('https://example.com/fake-journal/article/3003.mp4');
  await expect(vals.nth(3)).toContainText('https://example.com/fake-journal/article/3003.pdf');
  await expect(vals.nth(4)).toContainText('https://example.com/fake-journal/article/3003.xml');

  await expect(keys.nth(3)).toContainText('actors');
  await expect(vals.nth(5)).toContainText('Emily');
});

test('displays the right detail header styles when the type is unknown', async ({
  context,
  mount,
}) => {
  const widget = await renderWidgetWithDocmap(
    'get-me-a-docmap-yo',
    fakeDocmapWithTwoLonelyNodes,
    context,
    mount,
  );

  const nodeToClick = widget.locator('.node').nth(4);
  await nodeToClick.click({ force: true });

  // Assert the details view is visible after the click
  const detailsHeader = widget.locator('.detail-header');
  await expect(detailsHeader).toContainText('Type unknown');
  await expect(detailsHeader).toHaveAttribute(
    'style',
    `background: ${TYPE_UNKNOWN_DETAIL_HEADER_COLOR};`,
  );
  await expect(detailsHeader.locator('span')).toHaveAttribute('style', `color: #CDCDCD;`);
});

const timelineTestCases: [string, number][] = [
  ['fakeDocmapWithTwoLonelyNodes', 4],
  ['fakeDocmapWithEveryType', 6],
];
timelineTestCases.forEach(([docmapName, nodeToClickIndex]) => {
  test(`displays real nodes in the timeline for ${docmapName}`, async ({ context, mount }) => {
    const widget = await renderWidgetWithDocmap(
      docmapName,
      fixtures[docmapName].docmap,
      context,
      mount,
    );

    const thingToClick = widget.locator('.node').nth(nodeToClickIndex);
    await thingToClick.click({ force: true });

    const timeline = widget.locator('.detail-timeline');
    const timelineNodes = timeline.locator('.timeline-node');
    const expectedNodes = fixtures[docmapName].types;
    await expect(timelineNodes).toHaveCount(expectedNodes.length);
    const expectedNodeColors = expectedNodes.map(typeToDetailBackgroundColor);
    for (let i = 0; i < expectedNodeColors.length; i++) {
      const node = timelineNodes.nth(i);
      await expect(node).toHaveAttribute('fill', expectedNodeColors[i]);
    }

    const selectedNodeOutlines = timeline.locator('.selected-node-outline');
    await expect(selectedNodeOutlines).toHaveCount(1);
    const nodeXPos = await timelineNodes.nth(nodeToClickIndex).getAttribute('cx');
    const outlineXPos = await selectedNodeOutlines.first().getAttribute('cx');
    expect(nodeXPos).toEqual(outlineXPos);

    const outlineColor = await selectedNodeOutlines.first().getAttribute('stroke');
    const selectedNodeColor = typeToDetailBackgroundColor(expectedNodes[nodeToClickIndex]);
    expect(outlineColor).toEqual(selectedNodeColor);

    // The vertical line indicating the selected node looks like <path d='M${x} 7L${x} 35' ... />
    // We want to assert that the x position of the path is the same as the node's x position
    const selectedNodeLines = timeline.locator('.selected-node-line');
    await expect(selectedNodeLines).toHaveCount(1);
    const dAttribute = await selectedNodeLines.first().getAttribute('d');
    const dSplit = dAttribute.split(' ');
    expect(dSplit[0]).toEqual('M' + nodeXPos);
    expect(dSplit[1]).toEqual('7L' + nodeXPos);

    const lineColor = await selectedNodeLines.first().getAttribute('stroke');
    expect(lineColor).toEqual(selectedNodeColor);
  });
});

test(`clicking a node in the timeline takes you to that node`, async ({ context, mount }) => {
  const docmapName: string = 'fakeDocmapWithTwoLonelyNodes';
  const widget = await renderWidgetWithDocmap(
    docmapName,
    fixtures[docmapName].docmap,
    context,
    mount,
  );

  const firstNode = widget.locator('.node').nth(0);
  await firstNode.click({ force: true });

  await expect(widget.locator('.detail-header')).toContainText('Preprint');

  const nodeToClick = widget.locator('.timeline-node').nth(5);
  await nodeToClick.click({ force: true });
  await expect(widget.locator('.detail-header')).toContainText('Journal Article');
});

test(`clicking the back button takes you to the previous node`, async ({ context, mount }) => {
  const docmapName: string = 'fakeDocmapWithTwoLonelyNodes';
  const widget = await renderWidgetWithDocmap(
    docmapName,
    fixtures[docmapName].docmap,
    context,
    mount,
  );

  const secondNode = widget.locator('.node').nth(1);
  await secondNode.click({ force: true });

  await expect(widget.locator('.detail-header')).toContainText('Review Article');

  const backButton = widget.locator('.docmaps-timeline-back').first();
  await backButton.click({ force: true });
  await expect(widget.locator('.detail-header')).toContainText('Preprint');
});

test(`clicking back from the first node wraps you around to the last node`, async ({
  context,
  mount,
}) => {
  const docmapName: string = 'fakeDocmapWithTwoLonelyNodes';
  const widget = await renderWidgetWithDocmap(
    docmapName,
    fixtures[docmapName].docmap,
    context,
    mount,
  );

  const firstNode = widget.locator('.node').first();
  await firstNode.click({ force: true });

  await expect(widget.locator('.detail-header')).toContainText('Preprint');

  const backButton = widget.locator('.docmaps-timeline-back').first();
  await backButton.click({ force: true });
  await expect(widget.locator('.detail-header')).toContainText('Journal Article');
});

test(`clicking the forward button takes you to the next node`, async ({ context, mount }) => {
  const docmapName: string = 'fakeDocmapWithTwoLonelyNodes';
  const widget = await renderWidgetWithDocmap(
    docmapName,
    fixtures[docmapName].docmap,
    context,
    mount,
  );

  const secondNode = widget.locator('.node').nth(4);
  await secondNode.click({ force: true });

  await expect(widget.locator('.detail-header')).toContainText('Type unknown');

  const backButton = widget.locator('.docmaps-timeline-forward').first();
  await backButton.click({ force: true });
  await expect(widget.locator('.detail-header')).toContainText('Journal Article');
});

test(`clicking the forward button from the last node wraps you around to the first node`, async ({
  context,
  mount,
}) => {
  const docmapName: string = 'fakeDocmapWithTwoLonelyNodes';
  const widget = await renderWidgetWithDocmap(
    docmapName,
    fixtures[docmapName].docmap,
    context,
    mount,
  );

  const lastNode = widget.locator('.node').last();
  await lastNode.click({ force: true });

  await expect(widget.locator('.detail-header')).toContainText('Journal Article');

  const backButton = widget.locator('.docmaps-timeline-forward').first();
  await backButton.click({ force: true });
  await expect(widget.locator('.detail-header')).toContainText('Preprint');
});

test('Nodes that are alone on their y level are fixed to the center of the widget horizontally', async ({
  context,
  mount,
}) => {
  const widget = await renderWidgetWithDocmap(
    'this-docmap-has-3-lonely-nodes',
    fakeDocmapWithTwoLonelyNodes,
    context,
    mount,
  );

  const firstCircle = widget.locator('.node').first();
  await expect(firstCircle).toHaveAttribute('cx', '250');

  const secondCircle = widget.locator('.node').nth(1);
  await expect(secondCircle).toHaveAttribute('cx', '250');
});

// ---------- Test utilities and constants below this line ----------

const TYPE_UNKNOWN_DETAIL_HEADER_COLOR: string = '#777';

// TODO I don't like that this is basically a copy of the giant object in docmaps-widget.ts
// But unfortunately it's not as trivial as you'd expect to import the options from the source code
const typeShortLabelToOpts: {
  [key: string]: { longLabel: string; backgroundColor: string; textColor: string };
} = {
  R: {
    longLabel: 'Review',
    backgroundColor: '#1E2F48',
    textColor: '#D7E4FD',
  },
  P: {
    longLabel: 'Preprint',
    backgroundColor: '#077A12',
    textColor: '#CBFFD0',
  },
  ES: {
    longLabel: 'Evaluation Summary',
    backgroundColor: '#936308',
    textColor: '#FFEDCC',
  },
  RA: {
    longLabel: 'Review Article',
    backgroundColor: '#099CEE',
    textColor: '#CEEDFF',
  },
  JA: {
    longLabel: 'Journal Article',
    backgroundColor: '#880052',
    textColor: '#FFF',
  },
  ED: {
    longLabel: 'Editorial',
    backgroundColor: '#2A8781',
    textColor: '#FFFFFF',
  },
  CO: {
    longLabel: 'Comment',
    backgroundColor: '#B66248',
    textColor: '#FFF',
  },
  RE: {
    longLabel: 'Reply',
    backgroundColor: '#79109E',
    textColor: '#F6DBFF',
  },
  '': {
    longLabel: 'Type unknown',
    backgroundColor: '#CDCDCD',
    textColor: '#043945',
  },
};

const defaultOptions: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://example.com',
  },
};

async function renderWidgetWithDocmap(
  doi: string,
  docmap: any,
  context: BrowserContext,
  mount: any,
) {
  await mockDocmapForEndpoint(context, doi, docmap);
  const widget: Locator = await mount(DocmapsWidget, { props: { ...defaultOptions.props, doi } });
  return widget;
}

/**
 * Mocks out the api server's `/docmap_for/doi?subject=<doi>` endpoint to return a specific docmap
 *
 * @param context - The browser context to apply the mock routing on.
 * @param doi - The DOI (Document Object Identifier) to look for in the URL.
 * @param docmapToReturn - The docmap object to return in the response.
 */
async function mockDocmapForEndpoint(context: BrowserContext, doi: string, docmapToReturn: any) {
  const urlsToMock = (url: URL): boolean => url.toString().includes(defaultOptions.props.serverUrl);

  const mockHandler = async (route: Route, request: Request) => {
    let response: { body: string; status: number; contentType?: string } = {
      status: 400,
      body: `MOCK SERVER: No docmap found for doi '${doi}'`,
    };

    if (request.url().includes(doi)) {
      response = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(docmapToReturn),
      };
    }

    await route.fulfill(response);
  };

  await context.route(urlsToMock, mockHandler);
}

async function assertTooltipAppearsOnHover(
  widget: Locator,
  thingToHoverOver: Locator,
  expectedTooltipText: string,
) {
  await thingToHoverOver.hover({ trial: false, force: true });

  const tooltip = widget.locator('#tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(expectedTooltipText);

  const tooltipBoundingBox = await tooltip.boundingBox();
  expect(tooltipBoundingBox).toBeDefined();
  const nodeBoundingBox = await thingToHoverOver.boundingBox();
  expect(nodeBoundingBox).toBeDefined();

  // Check if the tooltip is near the node after hovering
  expect(tooltipBoundingBox.x).toBeGreaterThan(nodeBoundingBox.x);
  expect(tooltipBoundingBox.y).toBeLessThan(nodeBoundingBox.y + nodeBoundingBox.height);
}

const typeToDetailBackgroundColor = (type: string) =>
  type === '' ? TYPE_UNKNOWN_DETAIL_HEADER_COLOR : typeShortLabelToOpts[type].backgroundColor;
