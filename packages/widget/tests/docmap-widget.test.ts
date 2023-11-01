import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web'
import { DocmapsWidget } from '../src'
import { Locator } from '@playwright/test'
import { JsonObject } from '@playwright/experimental-ct-core/types/component'

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: { doi: 'test-doi' },
}

const dois = ['doi-1', 'doi-2']
for (const doi of dois) {
  test(`It renders the DOI: ${doi}`, async ({ mount }) => {
    const widget: Locator = await mount(DocmapsWidget, { props: { doi } })
    await expect(widget).toContainText(doi)
  })
}

test('The header bar is displayed in the graph view', async ({ mount }) => {
  const widget: Locator = await mount(DocmapsWidget, options)
  await expect(widget.locator('.widget-header')).toContainText('DOCMAP')
})

test('Clicking button increments the count', async ({ mount }) => {
  const widget: Locator = await mount(DocmapsWidget, options)
  await expect(widget.locator('circle')).toHaveCount(3)
  await expect(
    widget.getByRole('button', { name: 'Add 4th Node' }),
  ).toBeVisible()

  await widget.getByRole('button', { name: 'Add 4th Node' }).click()

  await expect(
    widget.getByRole('button', { name: 'Add 5th Node' }),
  ).toBeVisible()
  await expect(widget.locator('circle')).toHaveCount(4)
})
