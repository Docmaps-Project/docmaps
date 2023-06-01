import { ItemCmd, Client as CrossrefClient } from '@docmaps/etl'
import util from 'util'
import {isLeft} from 'fp-ts/lib/Either'

export async function configureForDoiString(rev, str) {

  let config = {
    display: {
      publisherName: name => name || "Unknown"
    }
  }

  const result = await ItemCmd(
    [str],
    {
      source: {
	preset: 'crossref-api',
	client: CrossrefClient,
      },
      publisher: {
	name: 'Discovered on api.crossref.org',
	url: 'https://github.com/docmaps-project/docmaps/tree/main/packages/ts-etl',
      },
    }
  );

  if (isLeft(result)) {
    console.log("Got error:", typeof result.left, util.inspect(result.left, {depth: 7}))
  } else {
    rev.configure({
      ...config,
      debug: true,
      docmaps: result.right,
    });
  }
}
