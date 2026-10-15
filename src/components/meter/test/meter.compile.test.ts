import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'meter')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `meter-probe-${name}.tsx`))
const INDEX = slash(join(FOLDER, 'index.tsx'))

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `import { Meter } from '../index.js'\n${code}\n`]))

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
  const errorsOf = (file: string) => ts.getPreEmitDiagnostics(program, program.getSourceFile(file))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  const out: Record<string, string[]> = { index: errorsOf(INDEX) }
  for (const name of Object.keys(snippets)) out[name] = errorsOf(probePath(name))
  return out
}

/** Every code block a reader can copy out of the hand-written half of the README, in order. */
function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()

const verdict = compile({
  readme: `export const sample = (\n<>\n${SAMPLES[0] ?? '<Missing />'}\n</>\n)`,
  unnamed: 'export const bad = <Meter value={40} />',
  labelled: "export const ok = <Meter value={40} aria-label='Battery' />",
  labelledby: "export const ok = <Meter min={0} max={1024} value={512} aria-labelledby='disk' />",
  both: "export const ok = <Meter aria-label='Battery' aria-labelledby='disk' />",
  valuetext: "export const ok = <Meter aria-label='Disk' value={512} max={1024} aria-valuetext='512 GB of 1 TB' />",
  child: "export const bad = <Meter aria-label='Battery'>Hello</Meter>",
  role: "export const bad = <Meter aria-label='Battery' role='progressbar' />",
  low: "export const bad = <Meter aria-label='Battery' low={20} />",
  valuenow: "export const ok = <Meter aria-label='Battery' aria-valuenow={150} />",
  token: "export const ok = <Meter aria-label='Battery' style={{ '--tc-meter-value': '40%' }} />",
})

describe('the sample in the README compiles as written', () => {
  it('finds the one sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(1)
    expect(SAMPLES[0]).toContain('<Meter min={0} max={1024} value={512}')
  })

  it('compiles with no error', () => {
    expect(verdict['readme']).toEqual([])
  })
})

describe('a name is required by the type (R-5.6-1)', () => {
  it('refuses a Meter with neither aria-label nor aria-labelledby', () => {
    // The message, not a count: a program that fails for any other reason also has errors.
    expect((verdict['unnamed'] ?? []).join(' ')).toContain("Property ''aria-labelledby'' is missing")
  })

  it('accepts aria-label alone, aria-labelledby alone, or both', () => {
    expect([verdict['labelled'], verdict['labelledby'], verdict['both']]).toEqual([[], [], []])
  })

  it('accepts aria-valuetext, for a reading said in units', () => {
    expect(verdict['valuetext']).toEqual([])
  })
})

describe('the attributes Meter writes itself, and the props it does not have', () => {
  it('refuses children, because it renders no text', () => {
    expect((verdict['child'] ?? []).join(' ')).toContain("Property 'children' does not exist")
  })

  it('refuses role, which is always meter', () => {
    expect((verdict['role'] ?? []).join(' ')).toContain("Property 'role' does not exist")
  })

  it('refuses low, because the bands are not built', () => {
    expect((verdict['low'] ?? []).join(' ')).toContain("Property 'low' does not exist")
  })

  it('still compiles aria-valuenow, as any hyphenated JSX attribute does, so the runtime order matters', () => {
    expect(verdict['valuenow']).toEqual([])
  })
})

describe('the --tc-* style keys reach a program that compiles only Meter', () => {
  it('type-checks the variable Meter sets on itself', () => {
    expect(verdict['index']).toEqual([])
  })

  it('lets a caller pass a --tc-* key in style too', () => {
    expect(verdict['token']).toEqual([])
  })
})
