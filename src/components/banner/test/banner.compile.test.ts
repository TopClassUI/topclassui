import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'banner')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `banner-probe-${name}.tsx`))

/** What a page that pastes a sample has in scope: the banner, a Button, the Svg and one icon. */
const PRELUDE = [
  "import { Banner } from '../index.js'",
  "import { Button } from '#components/button/index.js'",
  "import { Svg } from '#components/svg/index.js'",
  "import { bell } from '#icons/data/bell.js'",
  'export const used = [Banner, Button, Svg, bell]',
  'declare const flag: boolean',
  'export const decided = flag',
].join('\n')

const wrap = (code: string) => `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`

/** The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so no mutation could reach it. */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) => [probePath(name), wrap(code)]))

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

/** Every code block a reader can copy out of the hand-written half of the README, in order. */
function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()

const verdict = compile({
  readmeFirst: SAMPLES[0] ?? '<Missing />',
  readmeDismissal: SAMPLES[1] ?? '<Missing />',
  withHandler: '<Banner aria-label="N" dismissible id="a" onDismiss={() => undefined}>Out.</Banner>',
  noId: '<Banner aria-label="N" dismissible>Out.</Banner>',
  handlerAlone: '<Banner aria-label="N" onDismiss={() => undefined}>Out.</Banner>',
  plainWithId: '<Banner aria-label="N" id="a">Out.</Banner>',
  numberId: '<Banner aria-label="N" dismissible id={2}>Out.</Banner>',
  flagWithId: '<Banner aria-label="N" dismissible={flag} id="a" onDismiss={() => undefined}>Out.</Banner>',
  flagNoId: '<Banner aria-label="N" dismissible={flag}>Out.</Banner>',
  handlerWithIdAlone: '<Banner aria-label="N" id="a" onDismiss={() => undefined}>Out.</Banner>',
})

describe('the samples in the README compile as written', () => {
  it('finds the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[1]).toContain('<Banner dismissible id="release-v2"')
  })

  it('the banner with an icon and an action', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })

  it('the dismissible banner a server page writes', () => {
    expect(verdict['readmeDismissal']).toEqual([])
  })
})

describe('the id rule is a type', () => {
  it('takes dismissible with an id and a handler', () => {
    expect(verdict['withHandler']).toEqual([])
  })

  it('refuses dismissible with no id, which nothing could remember', () => {
    // TypeScript names one member of the union in its message, so the count is the claim.
    expect(verdict['noId']).toHaveLength(1)
    expect(verdict['noId']?.[0]).toContain("dismissible: true; }' is not assignable to type 'IntrinsicAttributes & BannerProps'")
  })

  it('refuses onDismiss on a banner that has no x', () => {
    expect(verdict['handlerAlone']).toHaveLength(1)
    expect(verdict['handlerWithIdAlone']).toHaveLength(1)
  })

  it('takes a boolean decided at runtime, which needs the id whatever its value (R-5.7-1)', () => {
    expect(verdict['flagWithId']).toEqual([])
    expect(verdict['flagNoId']).toHaveLength(1)
    expect(verdict['flagNoId']?.[0]).toContain("dismissible: boolean; }' is not assignable to type 'IntrinsicAttributes & BannerProps'")
  })

  it('leaves the id optional on a plain banner, and a string everywhere', () => {
    expect(verdict['plainWithId']).toEqual([])
    expect((verdict['numberId'] ?? []).join(' ')).toContain("Type 'number' is not assignable to type 'string'")
  })
})
