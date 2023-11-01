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

// This function is general enough we could move it elsewhere
export function getSteps(docmapPerhaps: any): StepT[] {
  const stepsMaybe = pipe(docmapPerhaps, Docmap.decode);

  if (E.isLeft(stepsMaybe)) {
    throw new TypeError(
      `Could not parse Docmap: ${JSON.stringify(docmapPerhaps)}`,
    );
  }

  const docmap = stepsMaybe.right;
  let nextStepId: string | null | undefined = docmap['first-step'];
  if (!nextStepId || !docmap.steps) {
    return [];
  }

  const visitedSteps: Set<string> = new Set(); // we keep track of visited steps for loop detection
  const orderedSteps: StepT[] = [];

  while (
    nextStepId &&
    nextStepId in docmap.steps &&
    !visitedSteps.has(nextStepId)
  ) {
    visitedSteps.add(nextStepId);
    const step: StepT = docmap.steps[nextStepId];
    orderedSteps.push(step);
    nextStepId = step['next-step'];
  }

  return orderedSteps;
}
