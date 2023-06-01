import { ItemCmd, Client as CrossrefClient } from '@docmaps/etl'
import util from 'util'
import {isLeft} from 'fp-ts/lib/Either'

export async function configureForDoiString(str, handleJson, handleError) {
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
    console.log("Got error while building docmap from crossref:", util.inspect(result.left, {depth: 7}));
    handleError(result.left)
  } else {
    handleJson(result.right)
  }
}
