import type { CrossrefClient } from 'crossref-openapi-client-ts'
import { Command, Option } from '@commander-js/extra-typings'
import { Publisher, PublisherT } from '@docmaps/sdk'
import { isLeft, right } from 'fp-ts/lib/Either'
import { process as proc } from './processor'

import * as crossref from './plugins/crossref'

import type { ErrorOrDocmap } from './types'
import { CrossrefPlugin } from './plugins/crossref'

export type PLUGIN_TYPE = 'crossref-api'

const stdoutWrite = (str: string) => process.stdout.write(str)

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

  cli
    .name('docmaps-cli')
    .description(
      'Command line utility for paginated/streamed creation of docmaps from similar data',
    )
    .version('0.1.0')

  const PLUGINOPTIONS: PLUGIN_TYPE[] = ['crossref-api']

  cli
    .command('item')
    .description('create docmap for a single doi based on chosen source')
    .argument('<doi>', 'doi to search and analyze for docmap creation')
    .addOption(
      new Option('--source <plugin>', `the plugin source name`)
        .preset(PLUGINOPTIONS[0])
        .choices(PLUGINOPTIONS)
        .makeOptionMandatory(),
    )
    .option(
      '--source.crossrefApi.politeMailto <email>',
      'email for crossref api polite label (your email)',
    )
    .option('--publisher.id <id>', 'id of publisher of docmaps to generate (you)')
    .option('--publisher.name <name>', 'name of publisher of docmaps to generate (you)')
    .option('--publisher.url <url>', 'url of publisher of docmaps to generate (you)')
    .option('--publisher.homepage <homepage>', 'homepage of publisher of docmaps to generate (you)')
    .option('--publisher.logo <logo>', 'logo of publisher of docmaps to generate (you)')
    .action(async (doi, options) => {
      const pub = Publisher.decode({
        id: options['publisher.id'],
        name: options['publisher.name'],
        homepage: options['publisher.homepage'],
        url: options['publisher.url'],
        logo: options['publisher.logo'],
      })

      if (isLeft(pub)) {
        cli.error(String(pub.left))
        throw 'unreachable, if cli.error exits (?)'
      }

      const politeMailto = options['source.crossrefApi.politeMailto']

      const crossrefConfig = politeMailto
        ? {
            politeMailto,
          }
        : {}

      const o: ItemOpts = {
        source: {
          preset: options.source,
          client: crossref.CreateCrossrefClient(crossrefConfig),
        },
        publisher: pub.right,
      }

      const result = await ItemCmd([doi], o)
      if (isLeft(result)) {
        cli.error(String(result.left))
        throw 'unreachable, if cli.error exits (?)'
      }

      const out = JSON.stringify(result.right)
      const writer = cli.configureOutput()?.writeOut || stdoutWrite
      writer(out)
    })

  // FIXME: this needs to be thought out. Work on #item for now.
  //
  // cli.command('page')
  //   .description('retrieve and pass one page of data from a given plugin to stdout as docmaps')
  //   .addOption(
  //     new Option( '--source', `the plugin source name`)
  //       .preset(PLUGINOPTIONS[0])
  //       .choices(PLUGINOPTIONS))
  //   .option('-L, --pageLength', 'number of elements to include in this single page', '2')
  //   .option('-O, --pageOffset', 'zero-indexed page number to start at (item offset is pageOffset * pageLength)', '2')
  //   .action((str, options) => {
  //     const PageOpts: PageOpts = {
  //       source: {
  //         preset: options.source,
  //         client: Client,
  //       },
  //       pageNumber: options.pageOffset,
  //     }
  //
  //     console.log(str.split(options.separator, limit));
  //   });
  return cli
}

// TODO rewrite this to assume it generates a stream of output rather than a single string
// .. although actually, the streaming may be a layer down instead
export type Cmd<ArgT extends string[], OptT> = (args: ArgT, opts: OptT) => Promise<ErrorOrDocmap>

export interface CrossrefConfiguration {
  preset: 'crossref-api'
  client: CrossrefClient
}

/**
 * ItemOpts
 *
 * Configuration for a single Item invocation.
 */
export interface ItemOpts {
  source: CrossrefConfiguration
  publisher: PublisherT
}

/**
 * ItemCmd
 *
 * Generates a Docmap for a single DOI. Behavior
 * may depend on the source configuration provided.
 */
export const ItemCmd: Cmd<[string], ItemOpts> = ([doi], opts) => {
  const plugin = CrossrefPlugin(opts.source.client)
  return proc(plugin, opts.publisher, doi)
}

/**
 * PageCmd
 *
 * Needs implementation!
 */
export interface PageOpts {
  source: CrossrefConfiguration
  prefix: string
  rowsPerPage?: number
  pageNumber?: number
}

export const PageCmd: Cmd<[], PageOpts> = async (_a, _opts) => {
  return right([])
}

const cli = MakeCli()
export default cli
