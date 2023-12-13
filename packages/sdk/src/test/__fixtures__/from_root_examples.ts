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

// because these create streams in the NTriples, if two tests consume the same
// stream the second one will fail. This method lets us construct a new tests
// object anytime.
export const FromRootExamplesNew = () => ({
  biorxiv_01_nt: loadDatasetNtriples('../../examples/docmaps-example-biorxiv-01.jsonld.nt'),
  elife_01_nt: loadDatasetNtriples('../../examples/docmaps-example-elife-01.jsonld.nt'),
  elife_02_nt: loadDatasetNtriples('../../examples/docmaps-example-elife-02.jsonld.nt'),
  embo_01_nt: loadDatasetNtriples('../../examples/docmaps-example-embo-01.jsonld.nt'),
  epmc_01_nt: loadDatasetNtriples('../../examples/docmaps-example-epmc-01.jsonld.nt'), // TODO not currently used in any test
  // This one has the new-styled `steps->actions->inputs` format
  epmc_01_updated_nt: loadDatasetNtriples(
    '../../examples/docmaps-example-epmc-01-updated.jsonld.nt',
  ),

  biorxiv_01_jsonld: loadDataset('../../examples/docmaps-example-biorxiv-01.jsonld'),
  epmc_01_jsonld: loadDataset('../../examples/docmaps-example-epmc-01.jsonld'),
  // This one has the new-styled `steps->actions->inputs` format
  epmc_01_updated_jsonld: loadDataset('../../examples/docmaps-example-epmc-01-updated.jsonld'),
  // TODO - note the difference in structure of the loading here
  elife_01_jsonld: loadDataset('../../examples/docmaps-example-elife-01.jsonld')[0],
  elife_02_jsonld: loadDataset('../../examples/docmaps-example-elife-02.jsonld')[0],
  // TODO - note the difference in structure of the loading here
  embo_01_jsonld: loadDataset('../../examples/docmaps-example-embo-01.jsonld')['@graph'][0][
    'docmap'
  ],
})

// in test suites where the streams are not consumed, duplication is OK.
export const FromRootExamples = FromRootExamplesNew()

// valid docmaps we can currently parse
const el_dm = [
  FromRootExamples.elife_01_jsonld,
  FromRootExamples.elife_02_jsonld,

  // TODO we are unable to currently assert on the bioRxiv example due to malformation:
  //      - the RoleInTime puts the Role under the Actor rather than sibling to
  //      - the Manifestation uses `webpage` rather than `web-page`.
  //    and maybe more!
  //
  // FromRootExamples.biorxiv_01_jsonld,

  FromRootExamples.embo_01_jsonld,
  FromRootExamples.epmc_01_updated_jsonld,
]

const el_dm_publisher = el_dm.flatMap((dm) => dm['publisher'] || [])
const el_dm_acc = el_dm_publisher.flatMap((p) => p['account'] || [])
const el_dm_step: any[] = el_dm.flatMap((dm) => Object.values(dm['steps']) || [])
const el_dm_action = el_dm_step.flatMap((s) => s['actions'] || [])
const el_dm_assertion = el_dm_step.flatMap((s) => s['assertions'] || [])
const el_dm_thing = el_dm_action.flatMap((a) => a['outputs'] || [])
const el_dm_action_inputs = el_dm_action.flatMap((a) => a['inputs'] || [])
const el_dm_mani = el_dm_thing.flatMap((t) => t['content'] || [])
const el_dm_role = el_dm_action.flatMap((a) => a['participants'] || [])
const el_dm_actor = el_dm_role.map((r) => r['actor'] || [])

export const PartialExamples = {
  elife: {
    Docmap: el_dm,
    Publisher: el_dm_publisher,
    OnlineAccount: el_dm_acc,
    Step: el_dm_step,
    Action: el_dm_action,
    Assertion: el_dm_assertion,
    Thing: el_dm_thing,
    ActionInputs: el_dm_action_inputs,
    Actor: el_dm_actor,
    RoleInTime: el_dm_role,
    Manifestation: el_dm_mani,
  },
}
