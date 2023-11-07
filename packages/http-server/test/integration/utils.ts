import { spawnSync } from 'child_process'
import { readdirSync } from 'fs'
import { join as fsjoin } from 'path'
import { HttpServer } from '../../src'
import { COUNT_TOTAL_TRIPLES_QUERY } from '../../src/sparql'
import { testLoggerWithPino } from '../utils'

const OXI_SPARQL_BACKEND_BASEURL = 'http://localhost:33078'

const OXI_SPARQL_BACKEND_CONFIG = {
  url: `${OXI_SPARQL_BACKEND_BASEURL}/query`,
}

function getProjectRoot(): string {
  const val = process.env['INIT_CWD']
  if (!val) {
    throw 'impossible failure: no initcwd in test script'
  }
  return val
}

function ensureSparqlBackend(log: (s: string) => void) {
  const root = getProjectRoot()
  const spawnOpts = { cwd: root }

  const checkIsUpProcess = spawnSync('curl', ['-k', `${OXI_SPARQL_BACKEND_BASEURL}`], spawnOpts)

  if (0 != checkIsUpProcess.status) {
    log(
      `[setup] Didn't find sparql backend locally at ${JSON.stringify(
        OXI_SPARQL_BACKEND_CONFIG,
      )}; response: ${checkIsUpProcess.stderr}`,
    )
    log('[setup] starting it now with docker...')

    const dockerProcess = spawnSync(
      'docker',
      [
        'compose',
        '-f',
        fsjoin('test', 'integration', 'assets', 'docker-compose.yml'),
        'up',
        '--wait',
      ],
      spawnOpts,
    )
    if (0 != dockerProcess.status) {
      log('failed to start docker for integration tests')
      throw dockerProcess
    }
    log('[setup] done starting docker.')
  } else {
    log(`[setup] backend already found at ${OXI_SPARQL_BACKEND_BASEURL}; skipping docker`)
  }

  // NOTE: see if there is at least one known docmap. This is required  because idempotent upload of
  // graphs with blank nodes is impossible. in test, we assume that if the dataset is nonempty,
  // then no more uploads should occur. For more info,
  //   see https://github.com/Docmaps-Project/rfcs/issues/2
  const checkHasDataProcess = spawnSync(
    'curl',
    [
      '-k',
      `${OXI_SPARQL_BACKEND_CONFIG.url}?query=${encodeURIComponent(
        COUNT_TOTAL_TRIPLES_QUERY.build(),
      )}`,
    ],
    spawnOpts,
  )

  const foundTriplesCount = Number(
    JSON.parse(checkHasDataProcess.stdout.toString()).results.bindings[0].n.value,
  )

  // ensure response contains at least 3 digits of counted triples
  if (!(foundTriplesCount > 400)) {
    log(
      `[setup] Didn't find enough triples locally at ${JSON.stringify(
        OXI_SPARQL_BACKEND_CONFIG,
      )}; response: ${checkHasDataProcess.stdout}`,
    )
    log('[setup] uploading static assets as test dataset')

    //  for all assets files:
    const assetsPath = fsjoin(root, 'test', 'integration', 'assets')
    const filesList = readdirSync(assetsPath, {
      encoding: 'utf-8',
      withFileTypes: true,
    }).filter((n) => n.name.endsWith('.nt'))

    const ulErrs = filesList.reduce<Error[]>((errs, dirent) => {
      const p = spawnSync('curl', [
        '-k',
        '-X',
        'POST',
        '-H',
        'Content-Type:application/n-triples',
        '-T',
        fsjoin(assetsPath, dirent.name),
        `${OXI_SPARQL_BACKEND_BASEURL}/store?default`,
      ])
      if (0 != p.status) {
        return [...errs, new Error(`failed to upload ${dirent.name}: "${p.stdout}"`)]
      }
      return errs
    }, [] as Error[])

    if (ulErrs.length > 0) {
      throw ulErrs
    }

    log(`[setup] finished uploading ${filesList.length} test triples files`)
  } else {
    log(
      `[setup] docmaps with ${foundTriplesCount} triples already found at ${OXI_SPARQL_BACKEND_BASEURL}; skipping upload`,
    )
  }
}

async function setupServer(log: (s: string) => void): Promise<HttpServer> {
  const s = new HttpServer(
    {
      server: {
        port: 33033,
        apiUrl: 'http://localhost:33033/docmaps/v1/',
      },
      backend: {
        type: 'sparqlEndpoint',
        sparqlEndpoint: OXI_SPARQL_BACKEND_CONFIG,
      },
    },
    {
      logger: testLoggerWithPino(log),
    },
  )

  await s.listen()
  return s
}

export async function withNewServer(
  work: (s: HttpServer) => Promise<void>,
  log: (s: string) => void,
) {
  const start = new Date().getTime()
  ensureSparqlBackend(log)
  const backend = new Date().getTime()
  const server = await setupServer(log)
  const setup = new Date().getTime()
  await work(server)
  const worked = new Date().getTime()
  await server.close()
  const closed = new Date().getTime()
  log(`[stats] Setup backend in\t${backend - start}\tms...`)
  log(`[stats] Setup test server in\t${setup - backend}\tms...`)
  log(`[stats] Performed test in\t\t${worked - setup}\tms...`)
  log(`[stats] Closed server in\t\t${closed - worked}\tms...`)
}
