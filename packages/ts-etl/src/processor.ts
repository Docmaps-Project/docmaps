import type * as D from 'docmaps-sdk'
import type { PluginMain } from './plugins/types';
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/pipeable'
import { stepArrayToDocmap } from './utils';
import type { ErrorOrDocmap } from './types';

export async function process<ID extends D.IRI>(
  // FIXME: the point of this encapsulation is to enable the Processor to handle the recursion eventually
  fun: PluginMain<ID>,
  publisher: D.PublisherT,
  id: ID,
): Promise<ErrorOrDocmap> {
  const program = pipe(
    fun(id),
    TE.chainEitherK((steps) => stepArrayToDocmap(publisher, id, steps)),
  )

  return await program()
}
