import test from 'ava'
import { CommanderError } from 'commander'
import type { DocmapT } from 'docmaps-sdk'
import cli from '../src/cli'

type cmdResult = {
  stderr: string
  stdout: string
  error?: Error
}

async function cmdIoResults(args: string): Promise<cmdResult> {
  const stderrLines: Array<string> = []
  const stdoutLines: Array<string> = []

  cli.exitOverride()
  cli.configureOutput({
    writeErr: (str) => stderrLines.push(str),
    writeOut: (str) => stdoutLines.push(str),
  })

  const cmd = cli.parseAsync(args.split(' '), { from: 'user' })

  try {
    const result = await cmd
    return {
      stderr: stderrLines.join('\n'),
      stdout: stdoutLines.join('\n'),
    }
  } catch (e) {
    return {
      stderr: stderrLines.join('\n'),
      stdout: stdoutLines.join('\n'),
      error: e as Error,
    }
  }
}

test('single item from crossref', async (t) => {
  const { stdout, stderr, error } = await cmdIoResults(
    'item --source crossref-api 10.5194/acp-9-8413-2009',
  )

  t.falsy(error)

  const dmArr = JSON.parse(stdout) as Array<DocmapT>

  t.is(dmArr[0]?.['type'], 'docmap')
  t.is(dmArr[0]?.['first-step'], '_:b0')
  t.truthy(dmArr[0]?.['steps'])

  const steps = dmArr[0]?.steps
  if (!steps) {
    t.fail('expected 2 steps')
    return
  }
  t.is(Object.keys(steps).length, 2)

  t.true(stdout.length < 4000) // depends on the actual example chosen. but this is to prevent regressions from explosions of added keys.
})
