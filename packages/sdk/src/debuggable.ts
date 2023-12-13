import * as pkg from '.'
import * as fixtures from './test/__fixtures__'

/**  Debug entrypoint script
 *
 *   This file can be used with the npm debugger to dive in to
 *   any issues we may face due to the algorithm complexity of
 *   jsonld.
 */

/* eslint-disable-next-line no-debugger */
debugger

const t = new pkg.TypedGraph()

const parsed = await t.pickStream(fixtures.FromRootExamples.elife_01_nt, pkg.DocmapNormalizedFrame)
console.log(parsed)
