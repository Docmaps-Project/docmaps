import { ItemCmd, Client as CrossrefClient } from '@docmaps/etl'
import util from 'util'
import {isLeft} from 'fp-ts/lib/Either'

export async function configureForDoiString(rev, str) {

  let config = {
    display: {
      publisherName: name => name.toUpperCase(),
    }
  }

  const result = await ItemCmd(
    [str],
    {
      source: {
	preset: 'crossref-api',
	client: CrossrefClient,
      },
      publisher: {},
    }
  );

  if (isLeft(result)) {
    console.log(util.inspect(result.left, {depth: 7}))
  } else {
    rev.configure({
      ...config,
      docmaps: result.right,
    });
  }
}
