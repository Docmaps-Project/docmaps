/* eslint @typescript-eslint/no-explicit-any: 0 */
import type { Stream } from '@rdfjs/types/stream'
import { isLeft } from 'fp-ts/lib/Either'
import { DocmapsFactory } from './types'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'

import SerializerJsonld from '@rdfjs/serializer-jsonld-ext'

const DM_JSONLD_CONTEXT = 'https://w3id.org/docmaps/context.jsonld'

export const TypedNodeShape = t.type({
  type: t.union([t.string, t.array(t.string)]),
})

export type TypedNodeShapeT = t.TypeOf<typeof TypedNodeShape>

// TODO : a constructor that accepts a partial (?) or a data table (?) or a rdf-object?

// TODO: make this generic/injectable
export type TypesFactory = typeof DocmapsFactory
export type TypesFactoryKeys = keyof TypesFactory

// TODO can this be made shorter , to not repeat?
export const DocmapNormalizedFrame: {
  type: 'docmap'
  'first-step': { '@embed': '@never' }
  'pwo:hasStep': {
    '@embed': '@always'
    'next-step': { '@embed': '@never' }
    'previous-step': { '@embed': '@never' }
  }
} = {
  type: 'docmap',
  'first-step': { '@embed': '@never' },
  'pwo:hasStep': {
    '@embed': '@always',
    'next-step': { '@embed': '@never' },
    'previous-step': { '@embed': '@never' },
  },
}

export type FrameSelection =
  | {
      // 'id'?: string,
      type: TypesFactoryKeys
    }
  | typeof DocmapNormalizedFrame

export class TypedGraph {
  factory: TypesFactory

  constructor(factory: TypesFactory = DocmapsFactory) {
    this.factory = factory
  }

  parseJsonldWithCodec<C extends t.Mixed>(c: C, jsonld: any): t.TypeOf<C> {
    const typedResult = c.decode(jsonld)

    if (isLeft(typedResult)) {
      throw new Error('decoding failed', { cause: typedResult.left })
    }

    return typedResult.right
  }

  // TODO - is this the flow we want?
  codecFor(jsonld: any): t.Mixed {
    // console.log(util.inspect(jsonld, {depth: null, colors: true}))

    // allow multiple types, whichever is first we should use

    let typesArr: string[]

    if (Array.isArray(jsonld['type'])) {
      typesArr = jsonld['type']
    } else {
      // wrap it in array
      typesArr = [jsonld['type']]
    }

    const errors: Error[] = []
    for (const tIdStr of typesArr) {
      const tId = tIdStr as TypesFactoryKeys
      if (!tId) {
        errors.push(
          new Error(
            `unable to type a jsonld object without type field: ${JSON.stringify(
              jsonld,
              null,
              '  ',
            )}`,
          ),
        )
        continue
      }

      const t = this.factory[tId]
      if (!t) {
        errors.push(
          new Error(
            `unable to type jsonld object: type \`${tId}\` is foreign to this type factory`,
          ),
        )
        continue
      }

      return t
    }

    // did not find a valid parsing
    throw errors
  }

  pickStream(s: Stream, frame: FrameSelection): TE.TaskEither<Error, TypedNodeShapeT> {
    const context = {
      '@context': {
        '@import': DM_JSONLD_CONTEXT,
      },
      ...frame,
    } as any // TODO: this cast is needed because DefinitelyTyped definition is out of date for this library.

    const serializer = new SerializerJsonld({
      context: context,
      frame: true,
      skipContext: true,
    })

    const output = serializer.import(s)

    return TE.tryCatch(
      () =>
        new Promise((res, rej) => {
          let done = false
          output
            // TODO: in what cases does this behave differently from computing on `end` messages?
            // currentlly it is for sure only handling hte first data object
            .on('data', (jsonld) => {
              try {
                const codec = this.codecFor(jsonld)
                done = true
                res(this.parseJsonldWithCodec(codec, jsonld))
              } catch (errors) {
                // TODO better error message handling
                done = true
                rej(new Error('no type annotations were parseable for object', { cause: errors }))
              }
            })
          output.on('error', (err) => {
            done = true
            rej(new Error('error received from upstream', { cause: err }))
          })
          output.on('end', () => {
            if (!done) {
              rej(new Error('jsonld streaming exited unexpectedly'))
            }
          })
          output.on('close', () => {
            if (!done) {
              rej(new Error('jsonld streaming exited unexpectedly'))
            }
          })
        }),
      (reason) => new Error('unable to pick jsonld from stream', { cause: reason }),
    )
  }
}
