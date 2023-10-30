import { contract } from './contract'
import { initClient, InitClientArgs } from '@ts-rest/core'

export function MakeHttpClient(opts: InitClientArgs) {
  return initClient(contract, opts)
}

const _localClient = MakeHttpClient({
  baseUrl: 'http://localhost:3000',
  baseHeaders: {},
})

export type DocmapsApiClientT = typeof _localClient
