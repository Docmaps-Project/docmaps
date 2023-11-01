import { expect, test } from '@sand4rt/experimental-ct-web'

import { DocmapsWidget } from '../src'

const defaultOptions = {
  props: {
    doi: 'test-doi',
  },
}

const dois = ['doi-1', 'doi-2']
for (const doi of dois) {
  test(`It renders the DOI: ${doi}`, async ({ mount }) => {
    const component = await mount(DocmapsWidget, {
      props: {
        doi,
      },
    })
    await expect(component).toContainText(doi)
  })
}

test('The header bar is displayed in the graph view', async ({ mount }) => {
  const component = await mount(DocmapsWidget, defaultOptions)
  await expect(component.locator('.widget-header')).toContainText('DOCMAP')
})

test('Clicking button increments the count', async ({ mount }) => {
  const component = await mount(DocmapsWidget, defaultOptions)
  await expect(component.locator('circle')).toHaveCount(3)
  await expect(
    component.getByRole('button', { name: 'Add 4th Node' }),
  ).toBeVisible()

  await component.getByRole('button', { name: 'Add 4th Node' }).click()

  await expect(
    component.getByRole('button', { name: 'Add 5th Node' }),
  ).toBeVisible()
  await expect(component.locator('circle')).toHaveCount(4)
})
