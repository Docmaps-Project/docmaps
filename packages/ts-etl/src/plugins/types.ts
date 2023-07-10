import type D from 'docmaps-sdk'
import type { TaskEither } from 'fp-ts/lib/TaskEither'
import type {ErrorOrDocmap} from '../types'

export type PluginMain<ID extends D.IRI> = (id: ID) => TaskEither<Error, D.StepT[]>;

