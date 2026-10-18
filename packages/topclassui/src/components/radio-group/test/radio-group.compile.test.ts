import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'radio-group')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `radio-group-probe-${name}.tsx`))

const PRELUDE = [
  "import { RadioGroupItem, RadioGroupRoot, type RadioGroupItemProps, type RadioGroupRootProps } from '../index.js'",
  'export const used = [RadioGroupItem, RadioGroupRoot]',
  'export type Used = [RadioGroupItemProps, RadioGroupRootProps]',
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [RadioGroupItem, RadioGroupRoot]\n`
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
const ITEMS = '<RadioGroupItem value="a">A</RadioGroupItem>'

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeField: sample(2),
  byAriaLabel: `<RadioGroupRoot aria-label="Plan">${ITEMS}</RadioGroupRoot>`,
  byLabelledBy: `<RadioGroupRoot aria-labelledby="plan-label">${ITEMS}</RadioGroupRoot>`,
  controlled: `<RadioGroupRoot aria-label="P" value="a" onValueChange={(next, details) => { void [next satisfies string, details.reason, details.cancel] }}>${ITEMS}</RadioGroupRoot>`,
  formProps: `<RadioGroupRoot aria-label="P" name="p" defaultValue="a" form="f" required readOnly disabled inputRef={{ current: null }}>${ITEMS}</RadioGroupRoot>`,
  design: `<RadioGroupRoot aria-label="P" size="xl" orientation="horizontal" invalid className="ms-2" ref={(node: HTMLDivElement | null) => { void node }}>${ITEMS}</RadioGroupRoot>`,
  itemProps: '<RadioGroupItem value="a" disabled readOnly id="a" className="ms-2" style={{ marginBlock: 4 }} inputRef={{ current: null }} ref={(node: HTMLButtonElement | null) => { void node }}>A</RadioGroupItem>',
  noName: `<RadioGroupRoot>${ITEMS}</RadioGroupRoot>`,
  onlyId: `<RadioGroupRoot id="plan">${ITEMS}</RadioGroupRoot>`,
  fieldNoLabel: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <RadioGroupRoot {...control} /> }',
  noValue: '<RadioGroupItem>A</RadioGroupItem>',
  numberValue: '<RadioGroupItem value={1}>A</RadioGroupItem>',
  numberHandler: `<RadioGroupRoot aria-label="P" onValueChange={(value) => { const wrong: number = value; void wrong }}>${ITEMS}</RadioGroupRoot>`,
  nativeButton: '<RadioGroupItem value="a" nativeButton={false}>A</RadioGroupItem>',
  render: '<RadioGroupItem value="a" render={<span />}>A</RadioGroupItem>',
  tone: `<RadioGroupRoot aria-label="P" tone="danger">${ITEMS}</RadioGroupRoot>`,
  badSize: `<RadioGroupRoot aria-label="P" size="xxl">${ITEMS}</RadioGroupRoot>`,
  badOrientation: `<RadioGroupRoot aria-label="P" orientation="diagonal">${ITEMS}</RadioGroupRoot>`,
  itemSize: '<RadioGroupItem value="a" size="sm">A</RadioGroupItem>',
  classFunction: "<RadioGroupItem value=\"a\" className={() => 'p-4'}>A</RadioGroupItem>",
  styleFunction: '<RadioGroupItem value="a" style={() => ({})}>A</RadioGroupItem>',
  itemRef: '<RadioGroupItem value="a" ref={(node: HTMLInputElement | null) => { void node }}>A</RadioGroupItem>',
  rootRef: `<RadioGroupRoot aria-label="P" ref={(node: HTMLButtonElement | null) => { void node }}>${ITEMS}</RadioGroupRoot>`,
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { RadioGroupItem, RadioGroupRoot } from 'topclassui/radio-group'")
    expect(SAMPLES[1]).toContain('<RadioGroupRoot aria-labelledby="plan-label" name="plan" defaultValue="pro">')
    expect(SAMPLES[2]).toContain('<RadioGroupRoot {...control} aria-labelledby=')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a RadioGroup takes', () => {
  for (const name of ['byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the controlled pair, whose handler reads a string and the details', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('every form prop of Base UI on the group', () => {
    expect(verdict['formProps']).toEqual([])
  })

  it('size, orientation, invalid, a className and a ref to the group', () => {
    expect(verdict['design']).toEqual([])
  })

  it('an item: disabled, readOnly, an id, a class and a style for its label, inputRef and a ref to its button', () => {
    expect(verdict['itemProps']).toEqual([])
  })
})

describe('what a RadioGroup refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a group with no name, or with an id alone, which no label can point at (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyId')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('the five props of a Field without aria-labelledby beside them', () => {
    expect(said('fieldNoLabel')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('an item with no value, or a value that is not a string', () => {
    expect(said('noValue')).toContain("Property 'value' is missing")
    expect(said('numberValue')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('a number read out of onValueChange: the value is a string, never any', () => {
    expect(said('numberHandler')).toContain("Type 'string' is not assignable to type 'number'")
  })

  it('nativeButton and render on an item: the radio is always our button', () => {
    expect(said('nativeButton')).toContain("Property 'nativeButton' does not exist")
    expect(said('render')).toContain("Property 'render' does not exist")
  })

  it('a tone, which is not built, a size outside the six, an orientation outside the two, a size on an item', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
    expect(said('badOrientation')).toContain('Type \'"diagonal"\' is not assignable')
    expect(said('itemSize')).toContain("Property 'size' does not exist")
  })

  it('the state functions Base UI takes as a className or a style, and a ref to another element', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('styleFunction')).toContain("Value of type '() => {}' has no properties in common with type 'Properties")
    expect(said('itemRef')).toContain('HTMLButtonElement')
    expect(said('rootRef')).toContain('HTMLDivElement')
  })
})
