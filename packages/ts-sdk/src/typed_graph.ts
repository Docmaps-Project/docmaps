import type { Stream } from '@rdfjs/types/stream';
import { isLeft } from 'fp-ts/lib/Either';
import {DocmapsFactory} from './types';
import * as t from 'io-ts';

import SerializerJsonld from '@rdfjs/serializer-jsonld-ext';

const DM_JSONLD_CONTEXT = 'https://w3id.org/docmaps/context.jsonld'

export const TypedNodeShape = t.type({
  'type': t.string,
});

export type TypedNodeShapeT = t.TypeOf<typeof TypedNodeShape>;

export interface NodeShapeCodec<A extends TypedNodeShapeT> extends t.Decoder<any, A>, t.Encoder<A, any> {}
// TODO : a constructor that accepts a partial (?) or a data table (?) or a rdf-object?

// TODO: make this generic/injectable
export type TypesFactory = typeof DocmapsFactory;
export type TypesFactoryKeys = keyof TypesFactory;


export class TypedGraph {
  factory: TypesFactory;

  constructor(
    factory: TypesFactory = DocmapsFactory,
  ) {
    this.factory = factory;
  }

  pickStream(s: Stream): Promise<TypedNodeShapeT> {
    const context = {
      '@context': {
        '@import': DM_JSONLD_CONTEXT,
      },
      'type': 'foaf:organization',
    } as any;

    const serializer = new SerializerJsonld({
      context: context,
      frame: true,
      compact: true,
      skipContext: true,
    })

    const output = serializer.import(s);

    return new Promise((res, rej) => {
      output.on('data', jsonld => {
        // test if this body can match
        const tId: TypesFactoryKeys = jsonld['type'];
        if (!tId) {
          return rej(new Error('unable to type a jsonld object without @type'));
        }

        const t = this.factory[tId];
        if (!t) {
          return rej(new Error(`unable to type jsonld object: @type ${tId} is foreign to this type factory`));
        }

        const typedResult = t.decode(jsonld);

        if (isLeft(typedResult)) {
          return rej(new Error("Failed to decode: " + JSON.stringify(typedResult.left)));
        } else {
          return res(typedResult.right);
        }
      })
    });
  }
}
