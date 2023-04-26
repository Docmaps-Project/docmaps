import type * as E from 'fp-ts/Either'
import type { DocmapT } from 'docmaps-sdk'

export type ErrorOrDocmap = E.Either<Error, DocmapT[]>;
