import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'checkbox')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `checkbox-probe-${name}.tsx`))

const PRELUDE = "import { Checkbox, type CheckboxProps } from '../index.js'\nexport const used = [Checkbox]\nexport type Used = CheckboxProps"

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [Checkbox]\n`
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
  readmeWrapped: sample(2),
  readmeMixed: sample(3),
  byLabel: '<Checkbox id="terms" />',
  byAriaLabel: '<Checkbox aria-label="Terms" />',
  byLabelledBy: '<Checkbox aria-labelledby="terms-label" />',
  controlled: '<Checkbox aria-label="A" checked indeterminate onCheckedChange={(next, details) => { void [next satisfies boolean, details.reason, details.cancel] }} />',
  formProps: '<Checkbox aria-label="A" name="a" value="yes" uncheckedValue="no" form="f" required readOnly disabled parent inputRef={{ current: null }} />',
  fieldProps: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <Checkbox {...control} /> }',
  design: '<Checkbox aria-label="A" size="xl" invalid className="ms-2" ref={(node: HTMLButtonElement | null) => { void node }} />',
  noName: '<Checkbox />',
  onlyTitle: '<Checkbox title="Terms" />',
  nativeButton: '<Checkbox aria-label="A" nativeButton={false} />',
  render: '<Checkbox aria-label="A" render={<span />} />',
  booleanValue: '<Checkbox aria-label="A" value={true} />',
  onValueChange: '<Checkbox aria-label="A" onValueChange={() => undefined} />',
  stringHandler: '<Checkbox aria-label="A" onCheckedChange={(next: string) => { void next }} />',
  tone: '<Checkbox aria-label="A" tone="danger" />',
  badSize: '<Checkbox aria-label="A" size="xxl" />',
  classFunction: "<Checkbox aria-label=\"A\" className={() => 'p-4'} />",
  spanRef: '<Checkbox aria-label="A" ref={(node: HTMLInputElement | null) => { void node }} />',
  omitTrap: "type Wrapped = Omit<CheckboxProps, 'size'>\nexport const wrapped = (props: Wrapped) => <Checkbox {...props} />",
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the three samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(4)
    expect(SAMPLES[0]).toContain("import { Checkbox } from 'topclassui'")
    expect(SAMPLES[1]).toContain('<label htmlFor="terms">')
    expect(SAMPLES[2]).toContain('<label>\n  <Checkbox')
    expect(SAMPLES[3]).toContain('indeterminate={some && !all}')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeWrapped', 'readmeMixed']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a Checkbox takes', () => {
  for (const name of ['byLabel', 'byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the controlled pair and indeterminate, whose handler reads a boolean and the details', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('every form prop of Base UI, and parent', () => {
    expect(verdict['formProps']).toEqual([])
  })

  it('the five props a Field will hand it, spread as they are', () => {
    expect(verdict['fieldProps']).toEqual([])
  })

  it('size, invalid, a className and a ref to the button', () => {
    expect(verdict['design']).toEqual([])
  })
})

describe('what a Checkbox refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a checkbox with no name, or named by a title alone (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyTitle')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('nativeButton and render: the root is always our button', () => {
    expect(said('nativeButton')).toContain("Property 'nativeButton' does not exist")
    expect(said('render')).toContain("Property 'render' does not exist")
  })

  it('a boolean value and onValueChange: the state is checked (choice 2)', () => {
    expect(said('booleanValue')).toContain("Type 'boolean' is not assignable to type 'string'")
    expect(said('onValueChange')).toContain("Property 'onValueChange' does not exist")
    expect(said('stringHandler')).toContain("Type 'boolean' is not assignable to type 'string'")
  })

  it('a tone, which is not built, and a size outside the six', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
  })

  it('the state function Base UI takes as a className, and a ref to another element', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('spanRef')).toContain('HTMLButtonElement')
  })

  it('Omit over the props merges the three names into one where none is required, so the spread no longer compiles', () => {
    expect(said('omitTrap')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })
})
