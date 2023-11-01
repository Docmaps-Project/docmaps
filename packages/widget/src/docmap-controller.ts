import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { SimulationNodeDatum } from 'd3-force';
import { SimulationLinkDatum } from 'd3';
import { Docmap, DocmapT, StepT } from 'docmaps-sdk';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';

export type Node = SimulationNodeDatum & { id: string };
export type Link = SimulationLinkDatum<Node>;

// TODO this is not really tested
export const getDocmap: TaskFunction<[string, string], string> = async ([
  serverUrl,
  doi,
]): Promise<string> => {
  const client = MakeHttpClient({
    baseUrl: serverUrl,
    baseHeaders: {},
  });

  const resp = await client.getDocmapForDoi({ query: { subject: doi } });

  if (resp.status !== 200) {
    // TODO this is untested
    throw new Error(
      `Failed to fetch docmap. ${
        resp.body ? 'Server response was ' + resp.body : ''
      }`,
    );
  }

  // TODO parse safely!
  const rawDocmap = resp.body as DocmapT;
  // const steps: StepT[] = getSteps(rawDocmap);

  return rawDocmap.id;
};

export function getSteps(docmap: any): StepT[] {
  const stepsMaybe = pipe(docmap, Docmap.decode);

  if (E.isLeft(stepsMaybe)) {
    throw new TypeError(`Could not parse docmap: ${JSON.stringify(docmap)}`);
  }

  return [];
}
