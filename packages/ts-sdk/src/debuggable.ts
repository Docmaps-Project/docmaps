import * as pkg from '.';
import * as fixtures from './__fixtures__';

debugger;

const t = new pkg.TypedGraph();

const parsed = await t.pickStream(fixtures.FromRootExamples.elife_01, pkg.DocmapNormalizedFrame );
console.log(parsed);

