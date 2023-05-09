import { Command, Option } from '@commander-js/extra-typings'
import { isLeft } from 'fp-ts/lib/Either'
import { ItemOpts, ItemCmd } from './commands'
import { Client } from './plugins/crossref'

/**
 * CLI - the default export
 *
 * invoke this as a library by calling `parseAsync`--
 *   with no args, as in index.ts, it uses argv.
 *   or pass in string array to parse flags.
 */

export type PLUGIN_TYPE = 'crossref-api'

const stdoutWrite = (str: string) => process.stdout.write(str)

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
    .action(async (doi, options) => {
      const o: ItemOpts = {
        source: {
          preset: options.source,
          client: Client,
        },
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

const cli = MakeCli()
export default cli
