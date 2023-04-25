import { Command, Option } from '@commander-js/extra-typings'
import type { PageOpts } from './commands';
import { Client } from './crossref';

const cli = new Command()

cli
  .name('docmaps-cli')
  .description('Command line utility for paginated/streamed creation of docmaps from similar data')
  .version('0.1.0')

const PLUGINOPTIONS = [
  'crossref-api'
]

cli.parse()
