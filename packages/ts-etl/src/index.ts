import { Command } from '@commander-js/extra-typings'

const cli = new Command()

cli
  .name('docmaps-cli')
  .description('Command line utility for paginated/streamed creation of docmaps from similar data')
  .version('0.1.0')

cli.parse()
