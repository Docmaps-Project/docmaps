import { MakeHttpClient } from '@docmaps/http-client';
import { TaskFunction } from '@lit/task';
import { ActionT, ActorT, Docmap, DocmapT, RoleInTimeT, StepT, ThingT } from 'docmaps-sdk';
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
  const edges: DisplayObjectEdge[] = [];

  const seenIds: Set<string> = new Set();
  const nodesById: { [id: string]: DisplayObject } = {};
  let idCounter: number = 1;

  const processThing = (thing: ThingT, participants: RoleInTimeT[] = []) => {
    let inputId = thing.doi || thing.id;
    if (!inputId) {
      inputId = `n${idCounter}`;
      idCounter++;
    }

    if (!seenIds.has(inputId)) {
      nodesById[inputId] = thingToDisplayObject(thing, inputId, participants);
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
    const inputIds: string[] = step.inputs?.map((input) => processThing(input)) || [];

    // Process step outputs
    step.actions.forEach((action: ActionT) => {
      action.outputs.map((output: ThingT) => {
        const outputId = processThing(output, action.participants);

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

interface NameHaver {
  name: string;
}

function thingToDisplayObject(
  thing: ThingT,
  nodeId: string,
  participants: RoleInTimeT[],
): DisplayObject {
  // Make sure type is a string (not an array), and that it's one of the types we support displaying
  const providedType = (Array.isArray(thing.type) ? thing.type[0] : thing.type) ?? '??';
  const displayType = ALL_KNOWN_TYPES.indexOf(providedType) >= 0 ? providedType : '??';

  const published: string | undefined =
    thing.published && thing.published instanceof Date
      ? formatDate(thing.published)
      : thing.published;

  const content = thing.content
    ? thing.content
        .map((manifestation) => {
          return manifestation.url?.toString();
        })
        .filter((url): url is string => url !== undefined)
    : undefined;

  const actors = participants
    .map((participant) => participant.actor)
    .filter((actor: ActorT): actor is NameHaver => {
      // Actors can be anything, so we have to check that they have a name
      // @ts-ignore
      return actor !== undefined && actor?.name !== undefined;
    })
    .map((actor: NameHaver) => {
      return actor.name;
    })
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
  const month = date.getMonth() + 1;
  const day = date.getDate();

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
  return [...objects].sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}

export function sortDisplayObjectEdges(edges: DisplayObjectEdge[]): DisplayObjectEdge[] {
  return [...edges].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}
