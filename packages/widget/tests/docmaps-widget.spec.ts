import { expect, Page, test } from '@playwright/test'

test('The header bar is displayed in the graph view', async ({page}) => {
  await page.goto('/')
  await expect(page.locator(".widget-header")).toHaveText("DOCMAP")
})


test('clicking button increments the count', async ({ page }) => {
  await page.goto('/')

  await expectNodeCount(page, 3)
  await expect(page.getByRole('button', { name: 'Add 4th Node' })).toBeVisible()

  await page.getByRole('button', { name: 'Add 4th Node' }).click()

  await expect(page.getByRole('button', { name: 'Add 5th Node' })).toBeVisible()
  await expectNodeCount(page, 4)
})

async function expectNodeCount(page: Page, n: number) {
  const d3Canvas = await page.waitForSelector('#d3-canvas')
  const circles = await d3Canvas.$$('circle')
  expect(circles).toHaveLength(n)
}