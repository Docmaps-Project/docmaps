import cli from './cli'
export default cli

export * from './cli'
export * from './plugins/crossref'
export * from './types'

await cli.parseAsync()
