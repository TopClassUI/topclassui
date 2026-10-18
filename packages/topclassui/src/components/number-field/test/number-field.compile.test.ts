import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'number-field')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `number-field-probe-${name}.tsx`))

const PRELUDE = "import { NumberField, type NumberFieldProps } from '../index.js'\nexport const used = [NumberField]\nexport type Used = NumberFieldProps"

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [NumberField]\n`
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
  readmeSecond: sample(2),
  byLabel: '<NumberField id="guests" />',
  byAriaLabel: '<NumberField aria-label="Guests" />',
  byLabelledBy: '<NumberField aria-labelledby="guests-label" />',
  controlled: '<NumberField aria-label="A" value={null} onValueChange={(next, details) => { void [next satisfies number | null, details.reason, details.cancel] }} />',
  formProps: '<NumberField aria-label="A" name="a" form="f" required readOnly disabled inputRef={{ current: null }} />',
  baseProps: "<NumberField aria-label=\"A\" smallStep={0.01} largeStep={100} snapOnStep allowOutOfRange allowWheelScrub locale=\"ar-u-nu-arab\" format={{ style: 'percent' }} onValueCommitted={() => undefined} />",
  bounds: '<><NumberField aria-label="A" min={-5} max={5} step={0.5} /><NumberField aria-label="B" step="any" /></>',
  fieldProps: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <NumberField {...control} /> }',
  design: '<NumberField aria-label="A" size="xl" invalid fullWidth placeholder="0" className="ms-2" ref={(node: HTMLDivElement | null) => { void node }} />',
  noName: '<NumberField />',
  onlyTitle: '<NumberField title="Guests" />',
  render: '<NumberField aria-label="A" render={<span />} />',
  stringValue: '<NumberField aria-label="A" defaultValue="2" />',
  stepWord: '<NumberField aria-label="A" step="all" />',
  stringHandler: '<NumberField aria-label="A" onValueChange={(next: string) => { void next }} />',
  tone: '<NumberField aria-label="A" tone="danger" />',
  badSize: '<NumberField aria-label="A" size="xxl" />',
  classFunction: "<NumberField aria-label=\"A\" className={() => 'p-4'} />",
  spanRef: '<NumberField aria-label="A" ref={{ current: null as HTMLSpanElement | null }} />',
  omitTrap: "type Wrapped = Omit<NumberFieldProps, 'size'>\nexport const wrapped = (props: Wrapped) => <NumberField {...props} />",
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { NumberField } from 'topclassui/number-field'")
    expect(SAMPLES[1]).toContain('<label htmlFor="guests">')
    expect(SAMPLES[2]).toContain('details.cancel()')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeSecond']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a NumberField takes', () => {
  for (const name of ['byLabel', 'byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the controlled pair, whose handler reads a number or null and the details', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('every form prop of Base UI, and the rest of its props as they are', () => {
    expect(verdict['formProps']).toEqual([])
    expect(verdict['baseProps']).toEqual([])
  })

  it('numeric bounds and a step of any', () => {
    expect(verdict['bounds']).toEqual([])
  })

  it('the five props a Field will hand it, spread as they are', () => {
    expect(verdict['fieldProps']).toEqual([])
  })

  it('size, invalid, fullWidth, a placeholder, a className and a ref to the root div', () => {
    expect(verdict['design']).toEqual([])
  })
})

describe('what a NumberField refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a field with no name, or named by a title alone (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyTitle')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('render: the root is always our box', () => {
    expect(said('render')).toContain("Property 'render' does not exist")
  })

  it('a string value, a step that is a word other than any, and a handler that expects a string', () => {
    expect(said('stringValue')).toContain("Type 'string' is not assignable to type 'number'")
    expect(said('stepWord')).toContain('Type \'"all"\' is not assignable')
    expect(said('stringHandler')).toContain("is not assignable to type 'string'")
  })

  it('a tone, which is not built, and a size outside the six', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
  })

  it('the state function Base UI takes as a className, and a ref to another element than the root div', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('spanRef')).toContain('HTMLDivElement')
  })

  it('Omit over the props merges the three names into one where none is required, so the spread no longer compiles', () => {
    expect(said('omitTrap')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })
})
