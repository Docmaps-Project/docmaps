import * as pkg from '.';
import * as fixtures from './__fixtures__';

debugger;

const mani = fixtures.OneManifestationQuadstore();
const t = new pkg.TypedGraph();

const parsed = await t.pickStream(mani, {'type': 'web-page'} );
console.log(parsed);

