import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'stepper')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `stepper-probe-${name}.tsx`))

const PRELUDE = [
  "import { getLabels } from '#shared/labels/get-labels.js'",
  "import { Stepper } from '../index.js'",
  "const steps = [{ id: 'a', title: 'A' }]",
  'void [getLabels, Stepper, steps]',
].join('\n')

/** The part of the README a person writes, and the tsx fences in it as a reader copies them. */
const HAND = /<!-- hand-written -->([\s\S]*)<!-- \/hand-written -->/.exec(readFileSync(join(FOLDER, 'README.md'), 'utf8'))?.[1] ?? ''
const SAMPLES = [...HAND.matchAll(/```tsx\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\nexport const probe = (\n${code}\n)\n`]))

  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  host.getSourceFile = (name, language, ...rest) => {
    const code = probes.get(slash(name))
    return code === undefined ? getSourceFile(name, language, ...rest) : ts.createSourceFile(name, code, language)
  }
  host.fileExists = (name) => probes.has(slash(name)) || fileExists(name)
  host.readFile = (name) => probes.get(slash(name)) ?? readFile(name)

  const program = ts.createProgram([...probes.keys()], options, host)
  const out: Record<string, string[]> = {}
  for (const name of Object.keys(snippets)) {
    out[name] = ts.getPreEmitDiagnostics(program, program.getSourceFile(probePath(name)))
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  }
  return out
}

const verdict = compile({
  sample: SAMPLES[0] ?? 'the README has no sample',
  arabic: "<Stepper items={steps} {...getLabels('ar-u-nu-arab')} />",
  ownStatus: "<Stepper items={[{ id: 'a', title: 'A', status: 'error' }]} />",
  defaultValue: "<Stepper items={steps} defaultValue=\"a\" />",
  onValueChange: '<Stepper items={steps} onValueChange={() => undefined} />',
  badStatus: "<Stepper items={[{ id: 'a', title: 'A', status: 'skipped' }]} />",
})

describe('what the README tells a reader to write compiles', () => {
  it('holds one sample to copy, with value as an id', () => {
    expect(SAMPLES).toHaveLength(1)
    expect(SAMPLES[0]).toContain('value="details"')
    expect(SAMPLES[0]).toContain("{ id: 'account', title: 'Account' }")
  })

  it('compiles that sample as written, the steps a plain array of literals', () => {
    expect(verdict['sample']).toEqual([])
  })

  it('compiles the getLabels spread it names, and a step with its own status', () => {
    expect(HAND).toContain("`{...getLabels('ar-u-nu-arab')}`")
    expect(verdict['arabic']).toEqual([])
    expect(verdict['ownStatus']).toEqual([])
  })

  it('refuses the catalog\'s defaultValue and onValueChange, which are not built (choice 10)', () => {
    expect((verdict['defaultValue'] ?? []).join(' ')).toContain("Property 'defaultValue' does not exist")
    expect((verdict['onValueChange'] ?? []).join(' ')).toContain("Property 'onValueChange' does not exist")
  })

  it('refuses a status no list holds', () => {
    expect((verdict['badStatus'] ?? []).join(' ')).toContain('"skipped"')
  })
})
