import test from 'ava';
import {
  getSteps,
  sortDisplayObjectEdges,
  sortDisplayObjects,
  stepsToGraph,
} from '../../src/docmap-controller';
import docmapWithOneStep from '../fixtures/sciety-docmap-1';
import anotherDocmapWithOneStep from '../fixtures/sciety-docmap-2';
import docmapWithMultipleSteps from '../fixtures/elife-docmap-1';

interface Item {
  type: string;
  doi: string;
}

test('getSteps when there is only one step', (t) => {
  const steps = getSteps(docmapWithOneStep);
  t.is(steps.length, 1);
  const step = steps[0];
  t.is(step.inputs[0].doi, '10.21203/rs.3.rs-1043992/v1');
  t.is(step.actions[0].outputs[0].type, 'review-article');
});

test('getSteps when there are multiple steps', (t) => {
  const steps = getSteps(docmapWithMultipleSteps);
  t.is(steps.length, 3);

  const originalPreprintPublication = steps[0].assertions[0];
  t.is(originalPreprintPublication.status, 'manuscript-published');
  t.is((originalPreprintPublication.item as Item).type, 'preprint');
  t.is(
    (originalPreprintPublication.item as Item).doi,
    '10.1101/2022.11.08.515698',
  );

  t.is(steps[1].assertions.length, 2);

  const elifePreprint = steps[1].assertions[0];
  t.is(elifePreprint.status, 'draft');
  t.is((elifePreprint.item as Item).type, 'preprint');
  t.is((elifePreprint.item as Item).doi, '10.7554/eLife.85111.1');

  const originalPreprintWithNewStatus = steps[1].assertions[1];
  t.is(originalPreprintWithNewStatus.status, 'under-review');
  t.is((originalPreprintWithNewStatus.item as Item).type, 'preprint');
  t.is(
    (originalPreprintWithNewStatus.item as Item).doi,
    '10.1101/2022.11.08.515698',
  );

  t.is(steps[2].assertions.length, 1);
  const originalPreprintPeerReviewed = steps[2].assertions[0];
  t.is(originalPreprintPeerReviewed.status, 'peer-reviewed');
  t.is((originalPreprintPeerReviewed.item as Item).type, 'preprint');
  t.is(
    (originalPreprintPeerReviewed.item as Item).doi,
    '10.1101/2022.11.08.515698',
  );
});

test('getSteps on non-docmaps', (t) => {
  const notADocmap = { this: 'is', some: 'randomly', shaped: ['object'] };
  const err = t.throws(() => getSteps(notADocmap), { instanceOf: TypeError });

  t.is(
    err?.message,
    'Could not parse Docmap: {"this":"is","some":"randomly","shaped":["object"]}',
  );
});

test('getSteps on docmaps without a first step', (t) => {
  const result = getSteps({ ...docmapWithOneStep, 'first-step': undefined });
  t.deepEqual(result, []);
});

test('getSteps on docmaps with no steps', (t) => {
  const result = getSteps({ ...docmapWithOneStep, steps: undefined });
  t.deepEqual(result, []);
});

test('stepsToGraph for a docmap with one step', (t) => {
  const steps = getSteps(docmapWithOneStep);
  const { nodes, edges } = stepsToGraph(steps);

  t.is(nodes.length, 2);

  const sortedNodes = sortDisplayObjects(nodes);
  t.like(sortedNodes[0], {
    nodeId: '10.21203/rs.3.rs-1043992/v1',
    doi: '10.21203/rs.3.rs-1043992/v1',
    type: '??',
  });

  t.like(sortedNodes[1], {
    nodeId: 'n1',
    type: 'review-article',
  });

  t.deepEqual(edges, [
    {
      sourceId: '10.21203/rs.3.rs-1043992/v1',
      targetId: 'n1',
    },
  ]);
});

test('stepsToGraph for another docmap with one step', (t) => {
  const steps = getSteps(anotherDocmapWithOneStep);
  const { nodes, edges } = stepsToGraph(steps);

  t.is(nodes.length, 4);

  const sortedNodes = sortDisplayObjects(nodes);
  t.like(sortedNodes[0], {
    doi: '10.21203/rs.3.rs-3171736/v1',
    nodeId: '10.21203/rs.3.rs-3171736/v1',
    type: '??',
  });
  t.like(sortedNodes[1], {
    nodeId: 'n1',
    type: 'review-article',
  });
  t.like(sortedNodes[2], {
    nodeId: 'n2',
    type: 'review-article',
  });
  t.like(sortedNodes[3], {
    nodeId: 'n3',
    type: 'review-article',
  });

  t.deepEqual(edges, [
    {
      sourceId: '10.21203/rs.3.rs-3171736/v1',
      targetId: 'n1',
    },
    {
      sourceId: '10.21203/rs.3.rs-3171736/v1',
      targetId: 'n2',
    },
    {
      sourceId: '10.21203/rs.3.rs-3171736/v1',
      targetId: 'n3',
    },
  ]);
});

test('stepsToGraph for a docmap with multiple steps', (t) => {
  const steps = getSteps(docmapWithMultipleSteps);
  const { nodes, edges } = stepsToGraph(steps);

  t.is(nodes.length, 6);

  const sortedNodes = sortDisplayObjects(nodes);
  t.like(sortedNodes[0], {
    doi: '10.1101/2022.11.08.515698',
    nodeId: '10.1101/2022.11.08.515698',
    type: 'preprint',
  });

  t.like(sortedNodes[1], {
    doi: '10.7554/eLife.85111.1',
    nodeId: '10.7554/eLife.85111.1',
    type: 'preprint',
  });
  t.like(sortedNodes[2], {
    doi: '10.7554/eLife.85111.1.sa1',
    nodeId: '10.7554/eLife.85111.1.sa1',
    type: 'reply',
  });
  t.like(sortedNodes[3], {
    doi: '10.7554/eLife.85111.1.sa2',
    nodeId: '10.7554/eLife.85111.1.sa2',
    type: 'review-article',
  });
  t.like(sortedNodes[4], {
    doi: '10.7554/eLife.85111.1.sa3',
    nodeId: '10.7554/eLife.85111.1.sa3',
    type: 'review-article',
  });
  t.like(sortedNodes[5], {
    doi: '10.7554/eLife.85111.1.sa4',
    nodeId: '10.7554/eLife.85111.1.sa4',
    type: 'evaluation-summary',
  });

  const sortedEdges = sortDisplayObjectEdges(edges);
  t.deepEqual(sortedEdges, [
    {
      sourceId: '10.1101/2022.11.08.515698',
      targetId: '10.7554/eLife.85111.1',
    },
    {
      sourceId: '10.1101/2022.11.08.515698',
      targetId: '10.7554/eLife.85111.1.sa2',
    },
    {
      sourceId: '10.1101/2022.11.08.515698',
      targetId: '10.7554/eLife.85111.1.sa1',
    },
    {
      sourceId: '10.1101/2022.11.08.515698',
      targetId: '10.7554/eLife.85111.1.sa4',
    },
    {
      sourceId: '10.1101/2022.11.08.515698',
      targetId: '10.7554/eLife.85111.1.sa3',
    },
  ]);
});
