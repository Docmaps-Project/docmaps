import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { ActorT, Docmap, DocmapT, RoleInTimeT, StepT, ThingT } from 'docmaps-sdk';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import { ALL_KNOWN_TYPES, DisplayObject, DisplayObjectEdge, DisplayObjectGraph } from './constants';

export type DocmapFetchingParams = [string, string]; // [serverUrl, doi]

export const getDocmap: TaskFunction<DocmapFetchingParams, DisplayObjectGraph> = async ([
  serverUrl,
  doi,
]): Promise<DisplayObjectGraph> => {
  const client = MakeHttpClient({
    baseUrl: serverUrl,
    baseHeaders: {},
  });

  const resp = await client.getDocmapForDoi({ query: { subject: doi } });

  if (resp.status !== 200) {
    // TODO this is untested
    throw new Error(
      `Failed to fetch docmap. ${resp.body ? 'Server response was ' + resp.body : ''}`,
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
    throw new TypeError(`Could not parse Docmap: ${JSON.stringify(docmapPerhaps)}`);
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
  const nodesById: { [id: string]: DisplayObject } = {};
  const edges: DisplayObjectEdge[] = [];

  let idCounter: number = 1;
  const idGenerator = (): string => {
    const newId = `n${idCounter}`;
    idCounter++;
    return newId;
  };

  steps.forEach((step) => processStep(step, nodesById, edges, idGenerator));

  const nodes: DisplayObject[] = Object.values(nodesById);
  return { nodes, edges };
}

function processStep(
  step: StepT,
  nodesById: { [id: string]: DisplayObject },
  edges: DisplayObjectEdge[],
  generateId: () => string,
) {
  const inputIds: string[] =
    step.inputs?.map((input) => processThing(input, nodesById, [], generateId)) || [];

  step.actions.forEach((action) => {
    action.outputs.forEach((output) => {
      const outputId = processThing(output, nodesById, action.participants, generateId);

      inputIds.forEach((inputId: string) => {
        edges.push({ sourceId: inputId, targetId: outputId });
      });
    });
  });
}

function processThing(
  thing: ThingT,
  nodesById: { [id: string]: DisplayObject },
  participants: RoleInTimeT[] = [],
  generateId: () => string,
): string {
  const id: string = thing.doi || thing.id || generateId();
  if (!(id in nodesById)) {
    nodesById[id] = thingToDisplayObject(thing, id, participants);
  }
  return id;
}

interface NameHaver {
  name: string;
}

function thingToDisplayObject(
  thing: ThingT,
  nodeId: string,
  participants: RoleInTimeT[],
): DisplayObject {
  // The specification allows type to be an array
  // If it is an array, we convert it to a single string and make sure it's one of the types we support displaying
  const providedType: string = (Array.isArray(thing.type) ? thing.type[0] : thing.type) ?? '??';
  const displayType: string = ALL_KNOWN_TYPES.indexOf(providedType) >= 0 ? providedType : '??';

  const published: string | undefined =
    thing.published && thing.published instanceof Date
      ? formatDate(thing.published)
      : thing.published;

  let content: string[] | undefined = undefined;
  if (thing.content) {
    content = thing.content
      .map((manifestation) => {
        return manifestation.url?.toString();
      })
      .filter((url): url is string => url !== undefined);
  }

  const actors = participants
    .map((participant) => participant.actor)
    .filter((actor: ActorT): actor is NameHaver => {
      // Actors can be anything, so we have to check that they have a name
      // @ts-ignore
      return actor && actor?.name;
    })
    .map((actor: NameHaver) => actor.name)
    .join(', ');

  return {
    nodeId,
    type: displayType,
    doi: thing.doi,
    id: thing.id,
    published,
    url: thing.url,
    content,
    actors,
  };
}

function formatDate(date: Date) {
  const yyyy = date.getFullYear();

  // The getMonth() method returns the month (0-11) for the specified date,
  // so you need to add 1 to get the correct month.
  const month: number = date.getMonth() + 1;
  const day: number = date.getDate();

  // Convert month and day numbers to strings and prefix them with a zero if they're below 10
  let mm = month.toString();
  if (month < 10) {
    mm = '0' + month;
  }

  let dd = day.toString();
  if (day < 10) {
    dd = '0' + day.toString();
  }

  return yyyy + '-' + mm + '-' + dd;
}

export function sortDisplayObjects(objects: DisplayObject[]): DisplayObject[] {
  return [...objects].sort((a: DisplayObject, b: DisplayObject) =>
    a.nodeId.localeCompare(b.nodeId),
  );
}

export function sortDisplayObjectEdges(edges: DisplayObjectEdge[]): DisplayObjectEdge[] {
  return [...edges].sort((a: DisplayObjectEdge, b: DisplayObjectEdge) =>
    a.sourceId.localeCompare(b.sourceId),
  );
}
