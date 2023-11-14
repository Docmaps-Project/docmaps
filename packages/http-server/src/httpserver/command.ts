import { Command, Option } from '@commander-js/extra-typings'
import { API_VERSION } from '../api_version'
import * as hs from './server'
import pino from 'pino'

// const stdoutWrite = (str: string) => process.stdout.write(str)

/**
 * CLI
 *
 * the MakeCli function creates instances of the Cli,
 * which is useful for re-use in test. The executable
 * script for this tool will use the singleton cli
 * (the default export).
 *
 * Invoke this as a library by calling `MakeCli().parseAsync`.
 *   with no args, as in index.ts, parseAsync uses argv.
 *   or pass in string array to parse flags.
 */

export function MakeCli() {
  const cli = new Command()

  const BACKEND_TYPES = ['memory', 'sparql-endpoint']
  const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

  cli
    .name('docmaps-api-server')
    .description(
      `API server in nodejs conforming to the Docmaps API Server Specification v${API_VERSION}`,
    )
    .version('0.1.0')

  cli
    .command('start')
    .description('start the server')
    .addOption(
      new Option('--logLevel <logLevel>', `the maximum log level to emit to stdout`)
        .env('DM_LOG_LEVEL')
        .default('info')
        .choices(LOG_LEVELS)
        .makeOptionMandatory(),
    )
    .addOption(
      new Option('--backendType <backendType>', `the plugin source name`)
        .env('DM_BACKEND_TYPE')
        .default(BACKEND_TYPES[0])
        .choices(BACKEND_TYPES)
        .makeOptionMandatory(),
    )
    .addOption(
      new Option('--server.port <port>', `port to listen on`)
        .env('DM_SERVER_PORT')
        .argParser(Number)
        .makeOptionMandatory(),
    )
    .addOption(
      new Option(
        '--server.apiUrl <url>',
        'the URL that this server can be reached at (for advertising purposes only)',
      )
        .env('DM_SERVER_API_URL')
        .makeOptionMandatory(),
    )
    .addOption(
      new Option(
        '--backend.sparqlEndpoint.url <url>',
        'url including scheme, host, port where the sparql endpoint can be reached',
      ).env('DM_BACKEND_SPARQL_ENDPOINT_URL'),
    )
    .addOption(
      new Option(
        '--backend.memory.baseIri <iri>',
        'IRI to use as the base/prefix IRI for the in memory triplestore',
      ).env('DM_BACKEND_MEMORY_BASE_IRI'),
    )
    .action(async (options) => {
      const serveConfig = {
        apiUrl: options['server.apiUrl'],
        port: options['server.port'],
      }

      let config: hs.ServerConfig
      switch (options['backendType']) {
        case 'memory':
          if (!options['backend.memory.baseIri']) {
            throw 'specified memory backend but no baseIri'
          }

          config = {
            server: serveConfig,
            backend: {
              type: 'memory',
              memory: {
                baseIri: options['backend.memory.baseIri'],
              },
            },
          }
          break

        case 'sparql-endpoint':
          if (!options['backend.sparqlEndpoint.url']) {
            throw 'specified sparqlEndpoint backend but no url'
          }

          config = {
            server: serveConfig,
            backend: {
              type: 'sparqlEndpoint',
              sparqlEndpoint: {
                url: options['backend.sparqlEndpoint.url'],
              },
            },
          }
          break
        default:
          throw 'specified illegal backendType: choose one of `memory`,`sparql-endpoint`'
      }

      const logger = pino({ name: '@docmaps/http-server', level: options.logLevel }).child({
        lang: 'ts',
        api_version: API_VERSION,
      })

      const server = new hs.HttpServer(config, { logger: logger })
      // Inject logging into the server config:
      //
      // const writer = cli.configureOutput()?.writeOut || stdoutWrite
      // writer(out)

      logger.info('finished setup')
      await server.listen()
    })

  return cli
}
