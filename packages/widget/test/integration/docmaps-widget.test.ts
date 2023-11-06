import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web';
import { DocmapsWidget } from '../../src';
import { BrowserContext, Locator, Request, Route } from '@playwright/test';
import { JsonObject } from '@playwright/experimental-ct-core/types/component';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://localhost:8080',
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

const docmapsToTest: [any, number, string[]][] = [
  [docmapWithOneStep, 2, ["", "RA"]],
  [anotherDocmapWithOneStep, 4, ["", "RA", "RA", "RA"]],
  [docmapWithMultipleSteps, 6, ["P", "P", "RA", "RE", "ES", "RA"]],
];

for (const [docmap, expectedNodes, expectedNodeLabels] of docmapsToTest) {
  test(`It retrieves a docmap from the server with ${expectedNodes} nodes`, async ({
    mount,
    context,
  }) => {
    const doi: string = 'should-return-something';
    await mockDocmapForEndpoint(context, doi, docmap);

    const widget: Locator = await mount(DocmapsWidget, {
      props: {
        ...options.props,
        doi,
      },
    });

    await expect(widget.locator('circle')).toHaveCount(expectedNodes);

    // assert the first circle is at the y location of 126
    const firstCircle = widget.locator('circle').first();
    const firstCircleBoundingBox = await firstCircle.boundingBox();
    expect(firstCircleBoundingBox).toBeDefined();
    expect(firstCircleBoundingBox.y).toBe(126);

    // assert the last circle is at the y location of 282.25
    const lastCircle = widget.locator('circle').last();
    const lastCircleBoundingBox = await lastCircle.boundingBox();
    expect(lastCircleBoundingBox).toBeDefined();
    expect(lastCircleBoundingBox.y).toBe(282.25);

    // assert the node labels are in the proper order
    await expect(widget.locator('text')).toHaveCount(expectedNodeLabels.length);
    for (let i = 0; i < expectedNodeLabels.length; i++) {
      const label = widget.locator('text').nth(i);
      await expect(label).toHaveText(expectedNodeLabels[i]);
    }
  });
}

test('Tooltips appear on mouseover', async ({ page, mount, context }) => {
  const docmap = docmapWithMultipleSteps; // Assuming you want to test with this data
  const doi: string = 'tooltip-doi-test';
  await mockDocmapForEndpoint(context, doi, docmap);

  const widget: Locator = await mount(DocmapsWidget, {
    props: {
      ...options.props,
      doi,
    },
  });

  // Replace 'circle' with the correct selector for the nodes in your graph
  await assertTooltipAppears(widget, widget.locator('circle').first(), 'Preprint');
  await assertTooltipAppears(widget, widget.locator('circle').nth(3), 'Reply');
});

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
  const shouldMockPredicate = (url: URL): boolean =>
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

  await context.route(shouldMockPredicate, mockHandler);
}

async function assertTooltipAppears(widget: Locator, node: Locator, expectedLabeel: string) {
  // Hover over the first node to trigger the tooltip
  await node.hover({ trial: false, force: true });

  // Find the tooltip and assert it is visible and has the correct content
  // Adjust the selector as needed to match your tooltip's implementation
  const tooltip = widget.locator('#tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(expectedLabeel); // Replace with the expected tooltip text based on your data

  // Optional: You can also check the position if you want to ensure the tooltip is appearing at the correct location
  const tooltipBoundingBox = await tooltip.boundingBox();
  const nodeBoundingBox = await node.boundingBox();

  expect(tooltipBoundingBox).toBeDefined();
  expect(nodeBoundingBox).toBeDefined();

  if (tooltipBoundingBox && nodeBoundingBox) {
    // Check if the tooltip is near the node after hovering
    expect(tooltipBoundingBox.x).toBeGreaterThan(nodeBoundingBox.x);
    expect(tooltipBoundingBox.y).toBeLessThan(nodeBoundingBox.y + nodeBoundingBox.height);
  }
}
