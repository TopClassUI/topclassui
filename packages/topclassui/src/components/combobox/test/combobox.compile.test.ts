import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'combobox')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `combobox-probe-${name}.tsx`))

const PRELUDE = [
  "import { Combobox, type ComboboxProps } from '../index.js'",
  'export const used = [Combobox]',
  'export type Used = ComboboxProps',
  "const ITEMS = [{ value: 'next', label: 'Next.js' }]",
  'export const items = ITEMS',
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Combobox]\n`
  if (code.startsWith('type ') || code.startsWith('export ')) return `${PRELUDE}\n${code}\n`
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
  readmeFirst: sample(1),
  readmeField: sample(2),
  byId: '<Combobox id="framework" items={ITEMS} />',
  byAriaLabel: '<Combobox aria-label="Framework" items={ITEMS} />',
  byLabelledBy: '<Combobox aria-labelledby="framework-label" items={ITEMS} />',
  controlled: '<Combobox aria-label="F" items={ITEMS} value={null} onValueChange={(next, details) => { void [next satisfies string | null, details.reason, details.cancel] }} />',
  formProps: '<Combobox aria-label="F" items={ITEMS} name="f" defaultValue="next" form="x" required readOnly disabled inputRef={{ current: null }} modal={false} />',
  query: '<Combobox aria-label="F" items={ITEMS} inputValue="ne" onInputValueChange={(text) => { void (text satisfies string) }} filter={null} />',
  paging: '<Combobox aria-label="F" items={ITEMS} hasMore loadMore={async () => { await Promise.resolve() }} loadMoreThreshold={20} status="loading-more" virtualize emptyFallback={<b>None</b>} />',
  design: '<Combobox aria-label="F" items={ITEMS} size="xl" invalid fullWidth placement="top-end" visibleRows={4} maxLength={null} placeholder="Search" className="ms-2" ref={(node: HTMLInputElement | null) => { void node }} />',
  readonlyItems: "export const list = [{ value: 'a', label: 'A', disabled: true }] as const\nexport const ok = <Combobox aria-label='F' items={list} />",
  noName: '<Combobox items={ITEMS} />',
  noItems: '<Combobox aria-label="F" />',
  multiple: '<Combobox aria-label="F" items={ITEMS} multiple />',
  virtualized: '<Combobox aria-label="F" items={ITEMS} virtualized />',
  limit: '<Combobox aria-label="F" items={ITEMS} limit={5} />',
  children: '<Combobox aria-label="F" items={ITEMS}>Next</Combobox>',
  numberValue: '<Combobox aria-label="F" items={ITEMS} value={1} />',
  shapeItems: '<Combobox aria-label="F" items={[{ id: \'next\', label: \'Next.js\' }]} />',
  badStatus: '<Combobox aria-label="F" items={ITEMS} status="error" />',
  badPlacement: '<Combobox aria-label="F" items={ITEMS} placement="left" />',
  classFunction: "<Combobox aria-label='F' items={ITEMS} className={() => 'p-4'} />",
  // Not a div: React's ref callback is bivariant, and an input is assignable to a div, which adds only `align`.
  wrongRef: '<Combobox aria-label="F" items={ITEMS} ref={(node: HTMLTextAreaElement | null) => { void node }} />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { Combobox } from 'topclassui/combobox'")
    expect(SAMPLES[1]).toContain('<Combobox id="framework" name="framework" items={[')
    expect(SAMPLES[2]).toContain('<Combobox {...control} items=')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a Combobox takes', () => {
  for (const name of ['byId', 'byAriaLabel', 'byLabelledBy', 'controlled', 'formProps', 'query', 'paging', 'design', 'readonlyItems']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a Combobox refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('no name (R-5.6-1), and no items', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('noItems')).toContain("Property 'items' is missing")
  })

  it('multiple, virtualized, limit and children are not props', () => {
    expect(said('multiple')).toContain("Property 'multiple' does not exist")
    expect(said('virtualized')).toContain("Property 'virtualized' does not exist")
    expect(said('limit')).toContain("Property 'limit' does not exist")
    expect(said('children')).toMatch(/children/)
  })

  it('a value that is not a string, and options of another shape', () => {
    expect(said('numberValue')).toContain("Type 'number' is not assignable")
    expect(said('shapeItems')).toMatch(/'value' is missing|'id' does not exist/)
  })

  it('a status of its own, a physical placement, a className function and a ref to another element', () => {
    expect(said('badStatus')).toContain('Type \'"error"\' is not assignable')
    expect(said('badPlacement')).toContain('Type \'"left"\' is not assignable')
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('wrongRef')).toContain('HTMLInputElement')
  })
})
