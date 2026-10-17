import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'progress')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `progress-probe-${name}.tsx`))
const INDEX = slash(join(FOLDER, 'index.tsx'))

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `import { Progress } from '../index.js'\n${code}\n`]))

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

const verdict = compile({
  unnamed: 'export const bad = <Progress value={40} />',
  labelled: "export const ok = <Progress value={40} aria-label='Upload' />",
  labelledby: "export const ok = <Progress value={40} aria-labelledby='storage' />",
  both: "export const ok = <Progress aria-label='Upload' aria-labelledby='storage' />",
  child: "export const bad = <Progress aria-label='Upload'>Hello</Progress>",
  role: "export const bad = <Progress aria-label='Upload' role='presentation' />",
  valuenow: "export const ok = <Progress aria-label='Upload' aria-valuenow={150} />",
  token: "export const ok = <Progress aria-label='Upload' style={{ '--tc-progress-value': '40%' }} />",
})

describe('a name is required by the type (R-5.6-1)', () => {
  it('refuses a Progress with neither aria-label nor aria-labelledby', () => {
    // The message, not a count: a program that fails for any other reason also has errors.
    expect((verdict['unnamed'] ?? []).join(' ')).toContain("Property ''aria-labelledby'' is missing")
  })

  it('accepts aria-label alone', () => {
    expect(verdict['labelled']).toEqual([])
  })

  it('accepts aria-labelledby alone', () => {
    expect(verdict['labelledby']).toEqual([])
  })

  it('accepts both, which is legal ARIA: aria-labelledby wins', () => {
    expect(verdict['both']).toEqual([])
  })
})

describe('the attributes Progress writes itself', () => {
  it('refuses children, because it renders no text', () => {
    expect((verdict['child'] ?? []).join(' ')).toContain("Property 'children' does not exist")
  })

  it('refuses role, which is always progressbar', () => {
    expect((verdict['role'] ?? []).join(' ')).toContain("Property 'role' does not exist")
  })

  it('still compiles aria-valuenow, as any hyphenated JSX attribute does, so the runtime order matters', () => {
    expect(verdict['valuenow']).toEqual([])
  })
})

describe('the --tc-* style keys reach a program that compiles only Progress', () => {
  it('type-checks the variable Progress sets on itself', () => {
    expect(verdict['index']).toEqual([])
  })

  it('lets a caller pass a --tc-* key in style too', () => {
    expect(verdict['token']).toEqual([])
  })
})
