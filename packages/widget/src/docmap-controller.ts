import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { ActorT, Docmap, DocmapT, ManifestationT, RoleInTimeT, StepT, ThingT } from 'docmaps-sdk';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import { ALL_KNOWN_TYPES, DisplayObject, DisplayObjectEdge, DisplayObjectGraph } from './util';

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

type NodesById = { [id: string]: DisplayObject };

export function stepsToGraph(steps: StepT[]): DisplayObjectGraph {
  let nodesById: NodesById = {};
  let edges: DisplayObjectEdge[] = [];

  for (const step of steps) {
    const { newNodesById, newEdges } = processStep(step, nodesById);
    nodesById = newNodesById;
    edges = [...edges, ...newEdges];
  }

  const nodes: DisplayObject[] = Object.values(nodesById);
  return { nodes, edges };
}

function processStep(
  step: StepT,
  nodesById: NodesById,
): { newNodesById: NodesById; newEdges: DisplayObjectEdge[] } {
  let newNodesById: NodesById = { ...nodesById };
  let newEdges: DisplayObjectEdge[] = [];

  const inputIds =
    step.inputs?.map((input) => {
      const result = processThing(input, newNodesById);
      newNodesById = result.nodesById;
      return result.id;
    }) || [];

  for (const action of step.actions) {
    for (const output of action.outputs) {
      const result = processThing(output, newNodesById, action.participants);
      newNodesById = result.nodesById;

      for (const inputId of inputIds) {
        newEdges.push({ sourceId: inputId, targetId: result.id });
      }
    }
  }

  return { newNodesById, newEdges: newEdges };
}

function processThing(
  thing: ThingT,
  nodesById: NodesById,
  participants: RoleInTimeT[] = [],
): {
  id: string;
  nodesById: NodesById;
} {
  const newNodesById = { ...nodesById };
  const id = thing.doi || thing.id || generateId(newNodesById);

  if (!(id in newNodesById)) {
    newNodesById[id] = thingToDisplayObject(thing, id, participants);
  }

  return { id, nodesById: newNodesById };
}

function generateId(nodesById: NodesById): string {
  let idCounter = 1;
  let newId = `n${idCounter}`;

  while (newId in nodesById) {
    idCounter++;
    newId = `n${idCounter}`;
  }

  return newId;
}

interface NameHaver {
  name: string;
}

function thingToDisplayObject(
  thing: ThingT,
  nodeId: string,
  participants: RoleInTimeT[],
): DisplayObject {
  const displayType: string = determineDisplayType(thing.type);
  const published: string | undefined = formatDateIfAvailable(thing.published);
  let content: string[] | undefined = extractContentUrls(thing.content);
  const actors: string = extractActorNames(participants);

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

function formatDateIfAvailable(date: Date | string | undefined) {
  return date && date instanceof Date ? formatDate(date) : date;
}

function determineDisplayType(ty: string | string[] | undefined): string {
  const singleType: string = (Array.isArray(ty) ? ty[0] : ty) ?? '??';
  return ALL_KNOWN_TYPES.includes(singleType) ? singleType : '??';
}

function extractContentUrls(content: ManifestationT[] | undefined) {
  return content
    ?.map((manifestation: ManifestationT) => manifestation.url?.toString())
    .filter((url: string | undefined): url is string => url !== undefined);
}

function extractActorNames(participants: RoleInTimeT[]) {
  return participants
    .map((participant) => participant.actor)
    .filter((actor: ActorT): actor is NameHaver => {
      // Actors can be anything, so we have to check that they have a name
      // @ts-ignore
      return actor && actor?.name;
    })
    .map((actor: NameHaver) => actor.name)
    .join(', ');
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
