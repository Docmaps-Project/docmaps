import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { ActionT, Docmap, DocmapT, StepT, ThingT } from 'docmaps-sdk';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';

// Each input and output of the Docmap's steps is converted into one of these
export interface DisplayObject {
  nodeId: string; // Used internally to construct graph, never rendered
  type: string;
  doi?: string;
  id?: string;
  published?: string;
  url?: URL;
}

export interface DisplayObjectEdge {
  sourceId: string;
  targetId: string;
}

export interface DisplayObjectGraph {
  nodes: DisplayObject[];
  edges: DisplayObjectEdge[];
}

export type DocmapFetchingParams = [string, string]; // [serverUrl, doi]

export const getDocmap: TaskFunction<
  DocmapFetchingParams,
  DisplayObjectGraph
> = async ([serverUrl, doi]): Promise<DisplayObjectGraph> => {
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

  const rawDocmap = resp.body;
  const steps: StepT[] = getSteps(rawDocmap);
  return stepsToGraph(steps);
};

// This function is general enough we could probably move it into the SDK
export function getSteps(docmapPerhaps: any): StepT[] {
  const stepsMaybe = pipe(docmapPerhaps, Docmap.decode);

  if (E.isLeft(stepsMaybe)) {
    throw new TypeError(
      `Could not parse Docmap: ${JSON.stringify(docmapPerhaps)}`,
    );
  }

  const docmap = stepsMaybe.right;
  return getOrderedSteps(docmap);
}

function getOrderedSteps(docmap: DocmapT): StepT[] {
  const steps = docmap.steps;
  let nextId: string | null | undefined = docmap['first-step'];

  const seen: Set<string> = new Set(); // we keep track of visited steps for loop detection
  const orderedSteps: StepT[] = [];

  while (nextId && steps && nextId in steps && !seen.has(nextId)) {
    seen.add(nextId);
    const step: StepT = steps[nextId];
    orderedSteps.push(step);
    nextId = step['next-step'];
  }

  return orderedSteps;
}

export function stepsToGraph(steps: StepT[]): DisplayObjectGraph {
  const edges: DisplayObjectEdge[] = [];

  const seenIds: Set<string> = new Set();
  const nodesById: { [id: string]: DisplayObject } = {};
  let idCounter: number = 1;

  const processThing = (thing: ThingT) => {
    let inputId = thing.doi || thing.id;
    if (!inputId) {
      inputId = `n${idCounter}`;
      idCounter++;
    }

    if (!seenIds.has(inputId)) {
      nodesById[inputId] = thingToDisplayObject(thing, inputId);
    }

    for (const id of [thing.doi, thing.id]) {
      if (id) {
        seenIds.add(id);
      }
    }
    return inputId;
  };

  steps.forEach((step: StepT) => {
    // Process step inputs
    const inputIds: string[] = step.inputs.map(processThing);

    // Process step outputs
    step.actions.forEach((action: ActionT) => {
      action.outputs.map((output: ThingT) => {
        const outputId = processThing(output);

        // Add an edge from every step input to this node
        inputIds.forEach((inputId: string) =>
          edges.push({ sourceId: inputId, targetId: outputId }),
        );
      });
    });
  });

  const nodes: DisplayObject[] = Object.values(nodesById);
  return { nodes, edges };
}

function thingToDisplayObject(thing: ThingT, nodeId: string): DisplayObject {
  const type = Array.isArray(thing.type) ? thing.type[0] : thing.type;
  return {
    nodeId,
    type: type ? type : '??',
    doi: thing.doi,
  };
}

export function sortDisplayObjects(objects: DisplayObject[]): DisplayObject[] {
  return [...objects].sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}

export function sortDisplayObjectEdges(
  edges: DisplayObjectEdge[],
): DisplayObjectEdge[] {
  return [...edges].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}
