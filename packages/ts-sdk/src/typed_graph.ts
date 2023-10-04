/* eslint @typescript-eslint/no-explicit-any: 0 */
import type { Stream } from '@rdfjs/types/stream'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { DocmapsFactory } from './types'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import * as t from 'io-ts'

import SerializerJsonld from '@rdfjs/serializer-jsonld-ext'
import * as util from 'util'

const DM_JSONLD_CONTEXT = 'https://w3id.org/docmaps/context.jsonld'

export const TypedNodeShape = t.type({
  type: t.union([t.string, t.array(t.string)]),
})

export type TypedNodeShapeT = t.TypeOf<typeof TypedNodeShape>

// TODO: make this generic/injectable
export type TypesFactory = typeof DocmapsFactory
export type TypesFactoryKeys = keyof TypesFactory

/** JSON-LD Framing document for docmaps
 *
 *  This is a constant of fixed type. It seems
 *  to work well for serialization, may not be the
 *  only thing that does .
 *
 * TODO: can this be made shorter , to not repeat?
 *
 * @since 0.11.0
 */
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

/** Union type representing allowed Frames.
 *
 * It is unclear if the `type`-based frame is
 * actually needed, because we expect the triples
 * to be filtered upstream. However we will
 * continue to support it until clarity emerges
 * that it is redundant.
 *
 * @since 0.11.0
 */
export type FrameSelection =
  | {
      // 'id'?: string,
      type: TypesFactoryKeys
    }
  | typeof DocmapNormalizedFrame

/** A type-aware structure for extracting objects from quads.
 *
 * This structure is capable of detecting based on the @type key
 * which of the allowed docmap codecs should be used for validation;
 * this is done with `pickStream`.
 * However, because it may create any one of those types, there is
 * still the need to cast the result or do type matching on it. It
 * is therefore unclear if this provides much value over having
 * to know the resulting type in advance.
 *
 * @since 0.11.0
 */
export class TypedGraph {
  factory: TypesFactory

  constructor(factory: TypesFactory = DocmapsFactory) {
    this.factory = factory
  }

  /** Thin error-throwing wrapper around `.decode`.
   *
   * This method exists for compatibility.
   *
   * @since 0.11.0
   */
  parseJsonldWithCodec<C extends t.Mixed>(c: C, jsonld: any): t.TypeOf<C> {
    const typedResult = c.decode(jsonld)

    if (isLeft(typedResult)) {
      throw new Error(`decoding failed: ${util.inspect(typedResult.left, { depth: 5 })}`)
    }

    return typedResult.right
  }

  /** chooses a codec.
   *
   * Returns errors or a Codec, based on the `type` key of
   * the input object.
   *
   * @since 0.11.0
   */
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

  // converts a Stream<Quad> (eventemitter of quad) into a single Object jsonld or error.
  private oneJsonldFrom(s: Stream, frame: FrameSelection): TE.TaskEither<Error, object> {
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
                done = true
                res(jsonld)
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

  /** Consumes a Stream, and may produce a typed object.
   *
   * @param frame: FrameSelection a JSON-LD Frame for serialization. Probably should be the Docmap Frame.
   * @param codec: Codec any io-ts codec, such as the ones provided in types.ts. This method is type-safe
   *               guaranteed to return an object of the type corresponding to the chosen Codec (or error).
   * @param s: Stream a stream of Quads or anything else accepted by `jsonld-serializer-ext`.
   *
   * @since 0.11.0
   */
  pickStreamWithCodec<C extends t.Mixed>(
    frame: FrameSelection,
    codec: C,
    s: Stream,
  ): TE.TaskEither<Error, t.TypeOf<C>> {
    const te_ld = this.oneJsonldFrom(s, frame)

    const decodeWithError = E.mapLeft(
      (errors) => new Error('failed to decode a docmap', { cause: errors }),
    )

    return pipe(
      te_ld,
      TE.chainEitherK((ld) => pipe(ld, codec.decode, decodeWithError)),
    )
  }

  /** Consumes a Stream, and may produce a typed object.
   *
   * @param s: Stream a stream of Quads or anything else accepted by `jsonld-serializer-ext`.
   * @param frame: FrameSelection a JSON-LD Frame for serialization. Probably should be the Docmap Frame.
   *
   * @since 0.11.0
   */
  pickStream(s: Stream, frame: FrameSelection): TE.TaskEither<Error, TypedNodeShapeT> {
    return pipe(
      TE.Do,
      TE.bind('jsonld', () => this.oneJsonldFrom(s, frame)),
      TE.bind('codec', ({ jsonld }) => TE.of(this.codecFor(jsonld))),
      TE.map(({ codec, jsonld }) => this.parseJsonldWithCodec(codec, jsonld)),
    )
  }
}
