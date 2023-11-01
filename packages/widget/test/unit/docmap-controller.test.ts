import test from 'ava';
// import elifeDocmap1 from '../fixtures/elife-docmap-1'
import { getSteps } from '../../src/docmap-controller';

// test('getSteps when there is only one step', t => {
//   const steps = getSteps(scietyDocmap1);
//   t.is(steps.length, 1)
//   t.deepEqual(steps[0], scietyDocmap1.steps['_:b1'])
// })

test('getSteps on invalid input', (t) => {
  const notADocmap = {
    this: 'is',
    some: 'randomly',
    shaped: ['object'],
  };
  const err = t.throws(
    () => {
      getSteps(notADocmap);
    },
    { instanceOf: TypeError },
  );

  t.is(
    err?.message,
    'Could not parse docmap: {"this":"is","some":"randomly","shaped":["object"]}',
  );
});
