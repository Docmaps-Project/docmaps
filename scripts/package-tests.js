import path from 'path'
import {fileURLToPath} from 'url'
import { validateShacl } from './validate-shacl.js'

// TODO rewrite with Jest

const __filename = path.basename(import.meta.url);
const __dirname = path.dirname(import.meta.url);
const ROOT_DIR = path.resolve(fileURLToPath(__dirname), "..")


const TEST_EXAMPLES = [
  // TODO : generate these .NT files from JSON-LD as part of testing
  `${ROOT_DIR}/examples/docmaps-example-embo-01.jsonld.nt`,
]

const SHACL_FILE = `${ROOT_DIR}/docmaps-shapes.ttl`

async function main() {
  var ex = ''
  for (ex of TEST_EXAMPLES) {
    validateShacl(SHACL_FILE, ex);
  }
}

main();
