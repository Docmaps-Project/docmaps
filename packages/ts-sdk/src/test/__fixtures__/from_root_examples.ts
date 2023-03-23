import fs from 'fs'
import factory from 'rdf-ext'
import ParserN3 from '@rdfjs/parser-n3'

function loadDatasetNtriples(filePath: string) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return parser.import(stream)
}

function loadDataset(filePath: string) {
  // TODO - note that in the eLife case, we have to parse out from the top-level array or graph
  return JSON.parse(fs.readFileSync(filePath).toString())
}

export const FromRootExamples = {
  biorxiv_01_nt: loadDatasetNtriples('../../examples/docmaps-example-biorxiv-01.jsonld.nt'),
  elife_01_nt: loadDatasetNtriples('../../examples/docmaps-example-elife-01.jsonld.nt'),
  embo_01_nt: loadDatasetNtriples('../../examples/docmaps-example-embo-01.jsonld.nt'),
  biorxiv_01_jsonld: loadDataset('../../examples/docmaps-example-biorxiv-01.jsonld'),
  // TODO - note the difference in structure of the response here
  elife_01_jsonld: loadDataset('../../examples/docmaps-example-elife-01.jsonld')[0],
  // TODO - note the difference in structure of the response here
  embo_01_jsonld: loadDataset('../../examples/docmaps-example-embo-01.jsonld')['@graph'][0][
    'docmap'
  ],
}

const el_dm = [
  FromRootExamples.elife_01_jsonld,

  // TODO we are unable to currently assert on the bioRxiv example due to malformation:
  //      - the RoleInTime puts the Role under the Actor rather than sibling to
  //      - the Manifestation uses `webpage` rather than `web-page`.
  //    and maybe more!
  //
  // FromRootExamples.biorxiv_01_jsonld,

  FromRootExamples.embo_01_jsonld,
]

const el_dm_publisher = el_dm.flatMap((dm) => dm['publisher'] || [])
const el_dm_acc = el_dm_publisher.flatMap((p) => p['account'] || [])
const el_dm_step: any[] = el_dm.flatMap((dm) => Object.values(dm['steps']) || [])
const el_dm_action = el_dm_step.flatMap((s) => s['actions'] || [])
const el_dm_thing = el_dm_action.flatMap((a) => a['outputs'] || [])
const el_dm_mani = el_dm_thing.flatMap((t) => t['content'] || [])
const el_dm_role = el_dm_action.flatMap((a) => a['participants'] || [])
const el_dm_actor = el_dm_role.map((r) => r['actor'] || [])

export const PartialExamples = {
  elife: {
    Docmap: el_dm,
    DocmapPublisher: el_dm_publisher,
    DocmapOnlineAccount: el_dm_acc,
    DocmapStep: el_dm_step,
    DocmapAction: el_dm_action,
    DocmapThing: el_dm_thing,
    DocmapActor: el_dm_actor,
    DocmapRoleInTime: el_dm_role,
    DocmapManifestation: el_dm_mani,
  },
}
