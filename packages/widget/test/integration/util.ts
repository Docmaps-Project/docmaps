import { Page, Request, Route } from '@playwright/test';

const STAGING_SERVER_URL: string = 'https://web-nodejs.onrender.com';

export async function renderWidgetWithDocmap(page: Page, doi: string, docmap: any) {
  await mockDocmapForEndpoint(page, doi, docmap);
  return await renderWidget(page, doi);
}

async function renderWidget(page: Page, doi: string) {
  await page.goto('/');
  await page.evaluate(
    ({ serverUrl, doi }) => {
      const root = document.querySelector('#root');
      if (root) {
        console.log('body found');
        root.innerHTML = `<div style='height:200px; background-color: red;'>
            <docmaps-widget serverurl='${serverUrl}' doi='${doi}'></docmaps-widget>
            </div>`;
      }
    },
    { serverUrl: STAGING_SERVER_URL, doi }, // This is not a regular closure, so we need to pass in the variables we want to use
  );
  await page.waitForSelector('docmaps-widget');

  return page.locator('docmaps-widget');
}

/**
 * Mocks out the api server's `/docmap_for/doi?subject=<doi>` endpoint to return a specific docmap
 */
async function mockDocmapForEndpoint(page: Page, doi: string, docmapToReturn: any) {
  const urlsToMock = (url: URL): boolean => url.toString().includes(STAGING_SERVER_URL);

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

  await page.route(urlsToMock, mockHandler);
}

export const TYPE_UNKNOWN_DETAIL_HEADER_COLOR: string = '#777';

// TODO I don't like that this is basically a copy of the giant object in docmaps-widget.ts
// But unfortunately it's not as trivial as you'd expect to import the options from the source code
export const typeShortLabelToOpts: {
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

export const typeToDetailBackgroundColor = (type: string) =>
  type === '' ? TYPE_UNKNOWN_DETAIL_HEADER_COLOR : typeShortLabelToOpts[type].backgroundColor;
