import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'code-block')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `code-block-probe-${name}.tsx`))

const PRELUDE = "import { CodeBlock, type CodeBlockProps } from '../index.js'\nimport { getLabels } from '#shared/labels/get-labels.js'\nexport const used = [CodeBlock, getLabels]\nexport type Used = CodeBlockProps"

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [CodeBlock]\n`
  return `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`
}

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
const sample = (index: number) => SAMPLES[index] ?? '<Missing />'

const verdict = compile({
  readmeImport: sample(0),
  readmeSample: sample(1),
  plain: '<CodeBlock>{`a\n  b`}</CodeBlock>',
  everything: '<CodeBlock lang="tsx" title={<b>page.tsx</b>} highlighted={<span>a</span>} showCopy={false} wrap id="x" className="mt-2" aria-describedby="h" ref={(node: HTMLDivElement | null) => { void node }}>a</CodeBlock>',
  labels: "<CodeBlock {...getLabels('ar')}>a</CodeBlock>",
  noChildren: '<CodeBlock title="a.ts" />',
  elementChild: '<CodeBlock><b>a</b></CodeBlock>',
  size: '<CodeBlock size="sm">a</CodeBlock>',
  theme: '<CodeBlock theme="dark">a</CodeBlock>',
  preRef: '<CodeBlock ref={(node: HTMLPreElement | null) => { void node }}>a</CodeBlock>',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toContain("import { CodeBlock } from 'topclassui'")
    expect(SAMPLES[1]).toContain('<CodeBlock lang="tsx" title="page.tsx">')
  })

  for (const name of ['readmeImport', 'readmeSample']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a CodeBlock takes', () => {
  for (const name of ['plain', 'everything', 'labels']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a CodeBlock refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('no code, and code as an element: the button copies a string', () => {
    expect(said('noChildren')).toMatch(/children/)
    expect(said('elementChild')).toMatch(/'children' prop expects type 'string'/)
  })

  it('a size or a theme, which are not built', () => {
    expect(said('size')).toContain("Property 'size' does not exist")
    expect(said('theme')).toContain("Property 'theme' does not exist")
  })

  it('a ref to the pre: the ref reaches the root div', () => {
    expect(said('preRef')).toContain('HTMLPreElement')
  })
})
