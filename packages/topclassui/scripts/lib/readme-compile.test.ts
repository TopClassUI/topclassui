// Every generated README is compiled: its import block, and what its closing line says each name passes on.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (slug: string) => slash(join(COMPONENTS, slug, 'test', 'readme-probe.tsx'))

const slugs = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(COMPONENTS, e.name, 'README.md')))
  .map((e) => e.name)

type Claim = 'element' | 'className' | 'none'
const EXPECT: Record<Claim, Record<string, boolean>> = {
  element: { id: true, ref: true, className: true },
  className: { id: false, ref: false, className: true },
  none: { id: false, ref: false, className: false, style: false },
}

const codeNames = (text: string) => [...text.matchAll(/`(\w+)`/g)].map((m) => m[1] ?? '')
const before = (text: string, phrase: RegExp) => codeNames(phrase.exec(text)?.[1] ?? '')

/** The import block's names, and the names each sentence of the closing line speaks for. */
function claimsOf(readme: string): { names: string[]; claims: [string, Claim][] } {
  const block = /## Import\n\n```tsx\n([\s\S]*?)\n```/.exec(readme)?.[1] ?? ''
  const names = (/import \{([\s\S]*?)\}/.exec(block)?.[1] ?? '').split(',').map((n) => n.trim()).filter(Boolean)
  const props = readme.slice(readme.indexOf('## Props'), readme.search(/## (Examples|Verified against)/))
  const none = before(props, /((?:`\w+`(?:, | and )?)+) draws? no element/)
  const className = before(props, /((?:`\w+`(?:, | and )?)+) takes? no attribute but `className`/)
  const anything = /Anything else (on another part|on ((?:`\w+`(?:, | and )?)+)|is passed to the root element|is passed to the element each part draws)/.exec(props)
  const element = anything === null ? []
    : anything[1] === 'on another part' ? names.filter((n) => !none.includes(n) && !className.includes(n))
      : anything[2] === undefined ? (anything[1]?.includes('root') ? names.slice(0, 1) : names)
        : codeNames(anything[2])
  const claims: [string, Claim][] = [
    ...none.map((n): [string, Claim] => [n, 'none']),
    ...className.map((n): [string, Claim] => [n, 'className']),
    ...element.map((n): [string, Claim] => [n, 'element']),
  ]
  return { names, claims }
}

function probeOf(readme: string): string {
  const { names, claims } = claimsOf(readme)
  const checks = claims.flatMap(([name, claim]) => Object.entries(EXPECT[claim]).map(([prop, has], i) =>
    `export const ${name}_${prop}_${String(i)}: Has<typeof ${name}, '${prop}'> = ${String(has)}`))
  return [
    `import { ${names.join(', ')} } from '../index.js'`,
    'type PropsOf<C> = C extends (props: infer P) => unknown ? P : { notAComponent: true }',
    'type Has<C, K extends string> = K extends keyof PropsOf<C> ? true : false',
    `export const used = [${names.join(', ')}]`,
    ...checks,
    '',
  ].join('\n')
}

function compile(probes: Map<string, string>): Map<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
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
  return new Map([...probes.keys()].map((path) => [path, ts.getPreEmitDiagnostics(program, program.getSourceFile(path))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))]))
}

const readmes = new Map(slugs.map((slug) => [slug, readFileSync(join(COMPONENTS, slug, 'README.md'), 'utf8')]))
const verdict = compile(new Map(slugs.map((slug) => [probePath(slug), probeOf(readmes.get(slug) ?? '')])))

describe('every generated README compiles as a reader pastes it', () => {
  it.each(slugs)('%s: its import names real exports, and each name passes on what the README says', (slug) => {
    expect(verdict.get(probePath(slug))).toEqual([])
  })

  it('reads a claim from every README, so a sentence the parser misses cannot pass unread', () => {
    const silent = slugs.filter((slug) => claimsOf(readmes.get(slug) ?? '').claims.length === 0)
    expect(silent).toEqual([])
  })
})
