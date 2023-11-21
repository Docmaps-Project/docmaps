import { expect, test } from '@playwright/test';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import fakeDocmapWithEveryType from '../fixtures/fake-docmap-with-every-thing-type';
import fakeDocmapWithTwoLonelyNodes from '../fixtures/fake-docmap-with-two-lonely-nodes';
import {
  renderWidgetWithDocmap,
  TYPE_UNKNOWN_DETAIL_HEADER_COLOR,
  typeShortLabelToOpts,
} from './util';

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

[
  'docmapWithOneStep',
  'anotherDocmapWithOneStep',
  'docmapWithMultipleSteps',
  'fakeDocmapWithEveryType',
].forEach((docmapName) => {
  test(`It can display ${docmapName} as a graph`, async ({ page }) => {
    const widget = await renderWidgetWithDocmap(page, docmapName, fixtures[docmapName].docmap);
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
