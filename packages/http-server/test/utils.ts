import pino, { Logger } from 'pino'

export function testLoggerWithPino(log: (s: string) => void): Logger {
  return pino(
    // options
    {
      level: 'trace',
    },
    // a pino.Destination
    { write: log },
  )
}
