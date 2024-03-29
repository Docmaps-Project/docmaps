import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { ActorT, Docmap, DocmapT, ManifestationT, RoleInTimeT, StepT, ThingT } from '@docmaps/sdk';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import {
  ALL_DISPLAY_OBJECT_TYPES,
  DisplayObject,
  DisplayObjectEdge,
  DisplayObjectGraph,
  mergeDisplayObjects,
} from './display-object';

export type DocmapFetchingParams = [string, string]; // [serverUrl, doi]

interface NodesById {
  [id: string]: DisplayObject;
}

interface IdAble {
  id?: string;
  doi?: string;
}

interface NameHaver {
  name: string;
}

export function docmapToDisplayObjectGraph(rawDocmap: any): DisplayObjectGraph {
  const steps: StepT[] = getSteps(rawDocmap);
  return stepsToGraph(steps);
}

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
      `Failed to fetch docmap. ${
        resp.body ? 'Server response was ' + JSON.stringify(resp.body) : ''
      }`,
    );
  }

  const rawDocmap = resp.body;
  return docmapToDisplayObjectGraph(rawDocmap);
};

// This function is general enough we could probably move it into the SDK
export function getSteps(docmapPerhaps: unknown): StepT[] {
  const stepsMaybe = pipe(docmapPerhaps, Docmap.decode);

  if (E.isLeft(stepsMaybe)) {
    throw new TypeError(
      `Could not parse Docmap: ${JSON.stringify(docmapPerhaps)}, found error: ${JSON.stringify(
        stepsMaybe.left,
      )}`,
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
  let nodesById: NodesById = {};
  let edges: DisplayObjectEdge[] = [];

  for (const step of steps) {
    const { newNodesById, newEdges } = nodesAndEdgesForStep(step, nodesById);
    nodesById = newNodesById;
    edges = [...edges, ...newEdges];
  }

  const nodes: DisplayObject[] = Object.values(nodesById);
  return { nodes, edges };
}

function nodesAndEdgesForStep(
  step: StepT,
  knownNodesById: NodesById,
): {
  newNodesById: NodesById;
  newEdges: DisplayObjectEdge[];
} {
  const newNodesById: NodesById = { ...knownNodesById };
  let newEdges: DisplayObjectEdge[] = [];

  const inputIds =
    step.inputs?.map((input) => {
      const newId = generateId(input);
      const dispObj = thingToDisplayObject(input, newId, []);
      newNodesById[newId] = mergeDisplayObjects(newNodesById[newId], dispObj);
      return newId;
    }) ?? [];

  for (const action of step.actions) {
    for (const output of action.outputs) {
      const newId = generateId(output);
      const dispObj = thingToDisplayObject(output, newId, action.participants);
      newNodesById[newId] = mergeDisplayObjects(newNodesById[newId], dispObj);

      const edgesForThisOutput: DisplayObjectEdge[] = inputIds.map(
        (inputId): DisplayObjectEdge => ({
          sourceId: inputId,
          targetId: newId,
        }),
      );
      newEdges = [...newEdges, ...edgesForThisOutput];
    }
  }

  // Return the newly created objects instead of the mutated ones
  return { newNodesById, newEdges };
}

function generateId(idable: IdAble): string {
  return idable.doi || idable.id || `n${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
}

function thingToDisplayObject(
  thing: ThingT,
  nodeId: string,
  participants: RoleInTimeT[],
): DisplayObject {
  const { doi, id, type, url } = thing;
  const published = formatDateIfAvailable(thing.published);
  const content = extractContentUrls(thing.content);
  const actors: string = extractActorNames(participants);

  return {
    nodeId,
    type: determineDisplayType(type),
    url: url?.toString(),
    doi,
    id,
    published,
    content,
    actors,
  };
}

function formatDateIfAvailable(date: Date | string | undefined) {
  if (date instanceof Date) {
    return formatDate(date);
  }

  return date;
}

function determineDisplayType(ty: string | string[] | undefined): string {
  const singleType: string = (Array.isArray(ty) ? ty[0] : ty) ?? '??';
  return ALL_DISPLAY_OBJECT_TYPES.includes(singleType) ? singleType : '??';
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
      // TODO: let us note that actors without names are ignored. Should
      // this be the case ?
      const downcast = actor as NameHaver;
      return downcast && !!downcast?.name;
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
