import type { Stream } from '@rdfjs/types/stream';
import { isLeft } from 'fp-ts/lib/Either';
import {DocmapsFactory} from './types';
import * as t from 'io-ts';
import util from 'util';

import SerializerJsonld from '@rdfjs/serializer-jsonld-ext';

const DM_JSONLD_CONTEXT = 'https://w3id.org/docmaps/context.jsonld'

export const TypedNodeShape = t.type({
  'type': t.union([
    t.string,
    t.array(t.string),
  ])
});

export type TypedNodeShapeT = t.TypeOf<typeof TypedNodeShape>;

export interface NodeShapeCodec<A extends TypedNodeShapeT> extends t.Decoder<any, A>, t.Encoder<A, any> {}
// TODO : a constructor that accepts a partial (?) or a data table (?) or a rdf-object?

// TODO: make this generic/injectable
export type TypesFactory = typeof DocmapsFactory;
export type TypesFactoryKeys = keyof TypesFactory;


// TODO can this be made shorter , to not repeat?
export const DocmapNormalizedFrame: {
  'type': 'docmap',
  "first-step": {"@embed": "@never"},
  "pwo:hasStep": {
    "@embed": "@always",
    "next-step": {"@embed": "@never"},
    "previous-step": {"@embed": "@never"}
  }
} = {
  'type': 'docmap',
  "first-step": {"@embed": "@never"},
  "pwo:hasStep": {
    "@embed": "@always",
    "next-step": {"@embed": "@never"},
    "previous-step": {"@embed": "@never"}
  }
}

export type FrameSelection = {
  'type': TypesFactoryKeys
  // 'id'?: string,
} | typeof DocmapNormalizedFrame;

export class TypedGraph {
  factory: TypesFactory;

  constructor(
    factory: TypesFactory = DocmapsFactory,
  ) {
    this.factory = factory;
  }

  parseJsonld(jsonld: any): TypedNodeShapeT {
    // console.log(util.inspect(jsonld, {depth: null, colors: true}))

    // allow multiple types, whichever is first we should use

    let typesArr: string[];

    if (Array.isArray(jsonld['type'])) {
      typesArr = jsonld['type'];
    } else {
      // wrap it in array
      typesArr = [jsonld['type']];
    }

    const errors: Error[] = [];
    for (const tIdStr of typesArr) {
      const tId = tIdStr as TypesFactoryKeys;
      if (!tId) {
        errors.push(new Error(`unable to type a jsonld object without type field: ${JSON.stringify(jsonld, null, '  ')}`));
        continue;
      }

      const t = this.factory[tId];
      if (!t) {
        errors.push(new Error(`unable to type jsonld object: type \`${tId}\` is foreign to this type factory`));
        continue;
      }

      const typedResult = t.decode(jsonld);

      if (isLeft(typedResult)) {
        errors.push(new Error(`Failed to decode a \`${tIdStr}\``, {cause: typedResult.left}));
        continue;
      }

      return typedResult.right;
    }

    // did not find a valid parsing
    throw errors;
  }

  pickStream(s: Stream, frame: FrameSelection): Promise<TypedNodeShapeT> {
    const context = {
      '@context': {
        '@import': DM_JSONLD_CONTEXT,
      },
      ...frame,
    } as any; // TODO: this cast is needed because DefinitelyTyped definition is out of date for this library.

    const serializer = new SerializerJsonld({
      context: context,
      frame: true,
      skipContext: true,
    })

    const output = serializer.import(s);

    return new Promise((res, rej) => {
      output.on('data', jsonld => {
        try {
          res(this.parseJsonld(jsonld));
        } catch (errors) {
          // TODO better error message handling
          console.log("error parsing: ", util.inspect(errors, {colors: true, depth: 5}))
          rej(new Error("no type annotations were parseable for object", {cause: errors}))
        }
      })
    });
  }
}
