import { expect, MountOptions, test } from '@sand4rt/experimental-ct-web'
import { DocmapsWidget } from '../../src'
import { BrowserContext, Locator, Request, Route } from '@playwright/test'
import { JsonObject } from '@playwright/experimental-ct-core/types/component'
import elifeDocmap1 from './fixtures/elife-docmap-1'

const options: MountOptions<JsonObject, DocmapsWidget> = {
  props: {
    doi: 'test-doi',
    serverUrl: 'http://localhost:8080',
  },
}

test('The header bar is displayed in the graph view', async ({ mount }) => {
  const widget: Locator = await mount(DocmapsWidget, options)
  await expect(widget.locator('.widget-header')).toContainText('DOCMAP')
})

test('It retrieves a docmap from the server', async ({ mount, context }) => {
  const doi: string = 'should-return-something'
  await mockDocmapForEndpoint(context, doi, elifeDocmap1)

  const widget: Locator = await mount(DocmapsWidget, {
    props: {
      ...options.props,
      doi,
    },
  })

  await expect(widget).toContainText(`Docmap ID: ${elifeDocmap1.id}`)

  // await expect(widget.locator('circle')).toHaveCount(4)
})

interface DocmapForResponse {
  body: string
  status: number
  contentType?: string
}

/**
 * Mocks out the api server's `/docmap_for/doi?subject=<doi>` endpoint to return a specific docmap
 *
 * @param context - The browser context to apply the mock routing on.
 * @param doi - The DOI (Document Object Identifier) to look for in the URL.
 * @param docmapToReturn - The docmap object to return in the response.
 */
async function mockDocmapForEndpoint(
  context: BrowserContext,
  doi: string,
  docmapToReturn: any,
) {
  const shouldMockPredicate = (url: URL): boolean =>
    url.toString().includes(options.props.serverUrl)

  const mockHandler = async (route: Route, request: Request) => {
    let response: DocmapForResponse = {
      status: 400,
      body: `MOCK SERVER: No docmap found for doi '${doi}'`,
    }

    if (request.url().includes(doi)) {
      response = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(docmapToReturn),
      }
    }

    await route.fulfill(response)
  }

  await context.route(shouldMockPredicate, mockHandler)
}
