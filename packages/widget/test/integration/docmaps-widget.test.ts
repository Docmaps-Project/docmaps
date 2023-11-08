import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web';
import { DocmapsWidget } from '../../src';
import { BrowserContext, Locator, Request, Route } from '@playwright/test';
import { JsonObject } from '@playwright/experimental-ct-core/types/component';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import fakeDocmapWithEveryType from '../fixtures/fake-docmap-with-every-thing-type';
import fakeDocmapWithTwoLonelyNodes from '../fixtures/fake-docmap-with-two-lonely-nodes';

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://example.com',
  },
};

// TODO I don't love that this is basically a copy of the giant object in docmaps-widget.ts
// But unfortunately it's not as trivial as you'd expect to import the options from there.
const typeShortLabelToOpts: {
  [key: string]: { longLabel: string; backgroundColor: string; textColor: string };
} = {
  R: {
    longLabel: 'Review',
    backgroundColor: '#222F46',
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
    textColor: '#FFF',
  },
  RA: {
    longLabel: 'Review Article',
    backgroundColor: '#099CEE',
    textColor: '#FFF',
  },
  JA: {
    longLabel: 'Journal Article',
    backgroundColor: '#7B1650',
    textColor: '#FFF',
  },
  ED: {
    longLabel: 'Editorial',
    backgroundColor: '#468580',
    textColor: '#FFFFFF',
  },
  CO: {
    longLabel: 'Comment',
    backgroundColor: '#AB664E',
    textColor: '#FFF',
  },
  RE: {
    longLabel: 'Reply',
    backgroundColor: '#79109E',
    textColor: '#FFF',
  },
  '': {
    longLabel: 'Type unknown',
    backgroundColor: '#EFEFEF',
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

const graphDisplayTestCases: [string, any, string[]][] = [
  ['docmapWithOneStep', docmapWithOneStep, ['', 'RA']],
  ['anotherDocmapWithOneStep', anotherDocmapWithOneStep, ['', 'RA', 'RA', 'RA']],
  ['docmapWithMultipleSteps', docmapWithMultipleSteps, ['P', 'P', 'RA', 'RE', 'ES', 'RA']],
  [
    'fakeDocmapWithEveryType',
    fakeDocmapWithEveryType,
    ['P', 'P', 'RA', 'JA', 'R', 'RE', 'CO', 'ED', 'ES', ''],
  ],
];
for (const [testName, docmap, expectedNodeLabels] of graphDisplayTestCases) {
  test(`It can display ${testName} as a graph`, async ({ mount, context }) => {
    const doi: string = 'should-return-something';
    await mockDocmapForEndpoint(context, doi, docmap);

    const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

    // const svgViewport = await widget.locator('svg').getAttribute('viewport');
    // const canvasWidth = svgViewport.split(' ')[2];

    await expect(widget.locator('circle')).toHaveCount(expectedNodeLabels.length);

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

const detailViewTestCases: [string, number, string][] = [
  ['Preprints', 0, 'P'],
  ['Journal Articles', 4, 'JA'],
];
for (const [testName, n, expectedShortLabel] of detailViewTestCases) {
  test(`Can display details view for ${testName}`, async ({ page, mount }) => {
    const docmap = fakeDocmapWithTwoLonelyNodes;
    const doi: string = 'get-me-a-docmap-yo';
    await mockDocmapForEndpoint(page.context(), doi, docmap);

    const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

    await expect(widget.locator('.node')).toHaveCount(5);
    const opts = typeShortLabelToOpts[expectedShortLabel];

    const nodeToClick = widget.locator('.node').nth(n);
    await nodeToClick.click({ force: true });

    await expect(widget.locator('.node')).toHaveCount(0);

    // Assert the details view is visible after the click
    const detailsHeader = widget.locator('.detail-header');
    await expect(detailsHeader).toBeVisible();
    await expect(detailsHeader).toContainText(opts.longLabel);
    await expect(detailsHeader).toHaveAttribute('style', `background: ${opts.backgroundColor};`);

    const closeButton = widget.locator('.close-button');
    await closeButton.click({ force: true });
    await expect(widget.locator('.node')).toHaveCount(5);
  });
}

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

// ---------- Test utilities are below this line ----------

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
