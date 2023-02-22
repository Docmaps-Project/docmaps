import path from 'path'
import {fileURLToPath} from 'url'
import { validateShacl } from './validate-shacl.js'

// TODO rewrite with Jest -- currently, because it runs in streams
//    the pass/fail does not connect with which test example failed in stdoot connect with which test example failed in stdout

const __filename = path.basename(import.meta.url);
const __dirname = path.dirname(import.meta.url);
const ROOT_DIR = path.resolve(fileURLToPath(__dirname), "..")


const TEST_EXAMPLES = [
  // TODO : generate these .NT files from JSON-LD as part of testing
  `${ROOT_DIR}/examples/docmaps-example-embo-01.jsonld.nt`,
  `${ROOT_DIR}/examples/docmaps-example-elife-01.jsonld.nt`,
]

const SHACL_FILE = `${ROOT_DIR}/docmaps-shapes.ttl`

async function main() {
  var ex = ''
  console.log(`Using SHACL shape file: ${SHACL_FILE}`)
  console.log(`to validate data files...`)
  for (ex of TEST_EXAMPLES) {
    await validateShacl(SHACL_FILE, ex);
  }
}

main();
