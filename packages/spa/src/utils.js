import { ItemCmd, CreateCrossrefClient } from '@docmaps/etl'
import util from 'util'
import {isLeft} from 'fp-ts/lib/Either'


export function structureError(error) {
  error['type'] = 'error'
  return JSON.stringify(error, ['message', 'cause', 'type'])
}
