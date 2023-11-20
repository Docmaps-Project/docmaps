import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web';
import { DocmapsWidget } from '../../src';
import { BrowserContext, Locator, Request, Route } from '@playwright/test';
import { JsonObject } from '@playwright/experimental-ct-core/types/component';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import fakeDocmapWithEveryType from '../fixtures/fake-docmap-with-every-thing-type';
import fakeDocmapWithTwoLonelyNodes from '../fixtures/fake-docmap-with-two-lonely-nodes';

const fixtures = {
  docmapWithMultipleSteps,
  docmapWithOneStep,
  anotherDocmapWithOneStep,
  fakeDocmapWithEveryType,
  fakeDocmapWithTwoLonelyNodes,
};

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://example.com',
  },
};

// TODO I don't love that this is basically a copy of the giant object in docmaps-widget.ts
// But unfortunately it's not as trivial as you'd expect to import the options from the source code
const typeShortLabelToOpts: {
  [key: string]: { longLabel: string; backgroundColor: string; textColor: string };
} = {
  R: {
    longLabel: 'Review',
    backgroundColor: '#1E2F48', // updated
    textColor: '#D7E4FD',
  },
  P: {
    longLabel: 'Preprint',
    backgroundColor: '#077A12', // same as before, no change needed
    textColor: '#CBFFD0',
  },
  ES: {
    longLabel: 'Evaluation Summary',
    backgroundColor: '#936308', // same as before, no change needed
    textColor: '#FFEDCC',
  },
  RA: {
    longLabel: 'Review Article',
    backgroundColor: '#099CEE', // same as before, no change needed
    textColor: '#CEEDFF',
  },
  JA: {
    longLabel: 'Journal Article',
    backgroundColor: '#880052', // updated
    textColor: '#FFF',
  },
  ED: {
    longLabel: 'Editorial',
    backgroundColor: '#2A8781', // updated
    textColor: '#FFFFFF',
  },
  CO: {
    longLabel: 'Comment',
    backgroundColor: '#B66248', // updated
    textColor: '#FFF',
  },
  RE: {
    longLabel: 'Reply',
    backgroundColor: '#79109E', // same as before, no change needed
    textColor: '#F6DBFF',
  },
  '': {
    longLabel: 'Type unknown',
    backgroundColor: '#CDCDCD', // updated
    textColor: '#043945',
  },
};

test('The header bar is displayed in the graph view even if the requested docmap does not exist', async ({
  mount,
  context,
}) => {
  await mockDocmapForEndpoint(context, 'not-the-requested-doi', docmapWithOneStep);
  const widget: Locator = await mount(DocmapsWidget, options);
  await expect(widget.locator('.widget-header')).toContainText('DOCMAP');
});

const graphDisplayTestCases: [string, string[]][] = [
  ['docmapWithOneStep', ['', 'RA']],
  ['anotherDocmapWithOneStep', ['', 'RA', 'RA', 'RA']],
  ['docmapWithMultipleSteps', ['P', 'P', 'RA', 'RE', 'ES', 'RA']],
  ['fakeDocmapWithEveryType', ['P', 'P', 'RA', 'JA', 'R', 'RE', 'CO', 'ED', 'ES', '']],
];
for (const [docmapName, expectedNodeLabels] of graphDisplayTestCases) {
  test(`It can display ${docmapName} as a graph`, async ({ mount, context }) => {
    const doi: string = 'should-return-something';
    const docmap = fixtures[docmapName];
    await mockDocmapForEndpoint(context, doi, docmap);

    const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

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
      const expectedStroke: string = hasType ? 'none' : '#777';
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
}

test('Tooltips appear on mouseover', async ({ mount, context, browserName }) => {
  const docmap = docmapWithMultipleSteps; // Assuming you want to test with this data
  const doi: string = 'tooltip-doi-test';
  await mockDocmapForEndpoint(context, doi, docmap);
  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  await assertTooltipAppearsOnHover(widget, widget.locator('.node').first(), 'Preprint');
  await assertTooltipAppearsOnHover(widget, widget.locator('.node').nth(3), 'Reply');

  if (browserName !== 'webkit') {
    // TODO for some reason this test fails on webkit even though the functionality does work on Safari.
    // This behavior is not important enough to spend time debugging right now.
    await assertTooltipAppearsOnHover(widget, widget.locator('.label').first(), 'Preprint');
    await assertTooltipAppearsOnHover(widget, widget.locator('.label').nth(3), 'Reply');
  }
});

// TODO test for Thing with no metadata

test(`Can display details view for a Preprint with every field`, async ({ page, mount }) => {
  const docmap = fakeDocmapWithTwoLonelyNodes;
  const doi: string = 'get-me-a-docmap-yo';
  await mockDocmapForEndpoint(page.context(), doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const expectedNodes = 6;
  await expect(widget.locator('.node')).toHaveCount(expectedNodes);
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
  await expect(keys).toHaveCount(expectedNodes);
  await expect(vals).toHaveCount(expectedNodes + 1); // +1 for the second content item

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
  await expect(widget.locator('.node')).toHaveCount(expectedNodes);
});

test('Can display details view for a Journal Article with different fields', async ({
  page,
  mount,
}) => {
  const docmap = fakeDocmapWithTwoLonelyNodes;
  const doi: string = 'get-me-a-docmap-yo';
  await mockDocmapForEndpoint(page.context(), doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

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
  page,
  mount,
}) => {
  const doi: string = 'get-me-a-docmap-yo';
  await mockDocmapForEndpoint(page.context(), doi, fakeDocmapWithTwoLonelyNodes);
  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const nodeToClick = widget.locator('.node').nth(4);
  await nodeToClick.click({ force: true });

  // Assert the details view is visible after the click
  const detailsHeader = widget.locator('.detail-header');
  await expect(detailsHeader).toContainText('Type unknown');
  await expect(detailsHeader).toHaveAttribute('style', `background: #777;`);
  await expect(detailsHeader.locator('span')).toHaveAttribute('style', `color: #CDCDCD;`);
});

test('displays real nodes in the timeline', async ({ page, mount }) => {
  const doi: string = 'fake-and-lonely-docmap';
  await mockDocmapForEndpoint(page.context(), doi, fakeDocmapWithTwoLonelyNodes);
  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const n = 4;
  const thingToClick = widget.locator('.node').nth(n);
  await thingToClick.click({ force: true });

  const timeline = widget.locator('.detail-timeline');
  const timelineNodes = timeline.locator('.timeline-node');
  await expect(timelineNodes).toHaveCount(6);
  const expectedNodes = ['P', 'RA', 'RA', 'RA', '', 'JA'];
  const expectedNodeColors = expectedNodes.map(typeToDetailBackgroundColor);
  for (let i = 0; i < expectedNodeColors.length; i++) {
    const node = timelineNodes.nth(i);
    await expect(node).toHaveAttribute('fill', expectedNodeColors[i]);
  }

  const selectedNodeOutlines = timeline.locator('.selected-node-outline');
  await expect(selectedNodeOutlines).toHaveCount(1);
  const nodeXPos = await timelineNodes.nth(n).getAttribute('cx');
  const outlineXPos = await selectedNodeOutlines.first().getAttribute('cx');
  expect(nodeXPos).toEqual(outlineXPos);

  const outlineColor = await selectedNodeOutlines.first().getAttribute('stroke');
  const selectedNodeColor = typeToDetailBackgroundColor("");
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

test('Nodes that are alone on their y level are fixed to the center of the widget horizontally', async ({
  page,
  mount,
}) => {
  const docmap = fakeDocmapWithTwoLonelyNodes;
  const doi: string = 'this-docmap-has-3-lonely-nodes';
  await mockDocmapForEndpoint(page.context(), doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const firstCircle = widget.locator('.node').first();
  await expect(firstCircle).toHaveAttribute('cx', '250');

  const secondCircle = widget.locator('.node').nth(1);
  await expect(secondCircle).toHaveAttribute('cx', '250');
});

// ---------- Test utilities below this line ----------

/**
 * Mocks out the api server's `/docmap_for/doi?subject=<doi>` endpoint to return a specific docmap
 *
 * @param context - The browser context to apply the mock routing on.
 * @param doi - The DOI (Document Object Identifier) to look for in the URL.
 * @param docmapToReturn - The docmap object to return in the response.
 */
async function mockDocmapForEndpoint(context: BrowserContext, doi: string, docmapToReturn: any) {
  const urlsToMock = (url: URL): boolean => url.toString().includes(options.props.serverUrl);

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

const typeToDetailBackgroundColor = (type) =>
  type === '' ? '#777' : typeShortLabelToOpts[type].backgroundColor;
