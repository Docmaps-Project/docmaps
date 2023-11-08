import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web';
import { DocmapsWidget } from '../../src';
import { BrowserContext, Locator, Request, Route } from '@playwright/test';
import { JsonObject } from '@playwright/experimental-ct-core/types/component';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import fakeDocmapWithEveryThingType from '../fixtures/fake-docmap-with-every-thing-type';

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://localhost:8080',
  },
};

// TODO I don't love that this is a copy of the giant object in docmaps-widget.ts
const expectedColorLabels = {
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

const docmapsToTest: [string, any, string[]][] = [
  ['docmapWithOneStep', docmapWithOneStep, ['', 'RA']],
  ['anotherDocmapWithOneStep', anotherDocmapWithOneStep, ['', 'RA', 'RA', 'RA']],
  ['docmapWithMultipleSteps', docmapWithMultipleSteps, ['P', 'P', 'RA', 'RE', 'ES', 'RA']],
  [
    'fakeDocmapWithEveryThingType',
    fakeDocmapWithEveryThingType,
    ['P', 'P', 'R', 'P', 'ES', 'RA', 'JA', 'ED', 'CO', 'RE', ''],
  ],
];

for (const [testName, docmap, expectedNodeLabels] of docmapsToTest) {
  test(`It retrieves the docmap ${testName} from the server with nodes`, async ({
    mount,
    context,
  }) => {
    const doi: string = 'should-return-something';
    await mockDocmapForEndpoint(context, doi, docmap);

    const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

    await expect(widget.locator('circle')).toHaveCount(expectedNodeLabels.length);

    const firstCircle = widget.locator('circle').first();
    const firstCircleBoundingBox = await firstCircle.boundingBox();
    expect(firstCircleBoundingBox).toBeDefined();

    const secondCircle = widget.locator('circle').nth(1);
    const secondCircleBoundingBox = await secondCircle.boundingBox();
    expect(secondCircleBoundingBox).toBeDefined();

    // Assert that secondCircleBoundingBox.y is roughly twice the value of firstCircleBoundingBox.y
    // Because in all the provided examples, the first node appears above the other nodes.
    // We use this math instead of a fixed value because the exact y values change depending on the browser/platform.
    expect(secondCircleBoundingBox.y).toBeGreaterThan(firstCircleBoundingBox.y * 1.7);
    expect(secondCircleBoundingBox.y).toBeLessThan(firstCircleBoundingBox.y * 2.3);

    // assert the nodes are properly styled and labeled
    await expect(widget.locator('circle')).toHaveCount(expectedNodeLabels.length);
    await expect(widget.locator('text')).toHaveCount(expectedNodeLabels.length);
    for (let i = 0; i < expectedNodeLabels.length; i++) {
      const hasType = !!expectedNodeLabels[i];
      const expectedStroke: string = hasType ? 'none' : '#777';
      const expectedStrokeWidth: string = hasType ? 'none' : '2px';
      const expectedStrokeDasharray: string = hasType ? 'none' : '8 4';
      const expectedBackgroundColor = expectedColorLabels[expectedNodeLabels[i]].backgroundColor;
      const expectedTextColor = expectedColorLabels[expectedNodeLabels[i]].textColor;

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

test('Tooltips appear on mouseover', async ({ page, mount, context }) => {
  const docmap = docmapWithMultipleSteps; // Assuming you want to test with this data
  const doi: string = 'tooltip-doi-test';
  await mockDocmapForEndpoint(context, doi, docmap);
  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  await assertTooltipAppearsOnHover(widget, widget.locator('.node').first(), 'Preprint');
  await assertTooltipAppearsOnHover(widget, widget.locator('.label').first(), 'Preprint');
  await assertTooltipAppearsOnHover(widget, widget.locator('.node').nth(3), 'Reply');
  await assertTooltipAppearsOnHover(widget, widget.locator('.label').nth(3), 'Reply');
});

test('Clicking a node opens the details view for that node', async ({ page, mount }) => {
  const docmap = fakeDocmapWithEveryThingType;
  const doi: string = 'get-me-a-docmap-yo';
  await mockDocmapForEndpoint(page.context(), doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const nodeToClick = widget.locator('circle').first();
  await nodeToClick.click({ force: true });

  const detailsHeader = widget.locator('.detail-header');

  // Assert the details view is visible after the click
  await expect(detailsHeader).toBeVisible();
  await expect(detailsHeader).toContainText('Preprint');
});

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

test('Nodes that are alone on their y level are fixed to the center of the widget horizontally', async ({
  page,
  mount,
}) => {
  const docmap = fakeDocmapWithEveryThingType;
  const doi: string = 'this-docmap-has-2-lonely-nodes';
  await mockDocmapForEndpoint(page.context(), doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, { props: { ...options.props, doi } });

  const firstCircle = widget.locator('.node').first();
  await expect(firstCircle).toHaveAttribute('cx', '250');

  const secondCircle = widget.locator('.node').nth(1);
  await expect(secondCircle).toHaveAttribute('cx', '250');
});

// ---------- Test utilities are below this line ----------

interface DocmapForResponse {
  body: string;
  status: number;
  contentType?: string;
}

/**
 * Mocks out the api server's `/docmap_for/doi?subject=<doi>` endpoint to return a specific docmap
 *
 * @param context - The browser context to apply the mock routing on.
 * @param doi - The DOI (Document Object Identifier) to look for in the URL.
 * @param docmapToReturn - The docmap object to return in the response.
 */
async function mockDocmapForEndpoint(context: BrowserContext, doi: string, docmapToReturn: any) {
  const mockTheseEndpoints = (url: URL): boolean =>
    url.toString().includes(options.props.serverUrl);

  const mockHandler = async (route: Route, request: Request) => {
    let response: DocmapForResponse = {
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

  await context.route(mockTheseEndpoints, mockHandler);
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
