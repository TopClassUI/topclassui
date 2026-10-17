import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'date-picker')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `date-picker-probe-${name}.tsx`))

const PRELUDE = [
  "import { DatePicker, type DatePickerProps } from '../index.js'",
  "import { Field } from '../../field/index.js'",
  'export const used = [DatePicker, Field]',
  'export type Used = DatePickerProps',
].join('\n')

/** The import lines compile as ones that use what they import, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) {
    return `${code.replace("'topclassui'", "'../index.js'").replace("'topclassui/field'", "'../../field/index.js'")}\nexport const imported = [DatePicker]\n`
  }
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
  byId: '<DatePicker id="check-in" />',
  byAriaLabel: '<DatePicker aria-label="Check-in" />',
  byLabelledBy: '<DatePicker aria-labelledby="check-in-label" />',
  controlled: '<DatePicker aria-label="C" value={null} onValueChange={(next) => { void (next satisfies string) }} />',
  formProps: '<DatePicker aria-label="C" name="c" defaultValue="2026-10-02" form="f" required disabled aria-describedby="h" aria-invalid />',
  design: '<DatePicker aria-label="C" size="xl" invalid fullWidth placement="top-end" minDate="2026-09-25" maxDate="2027-03-31" firstDayOfWeek={6} placeholder="Pick" className="ms-2" ref={(node: HTMLButtonElement | null) => { void node }} />',
  openState: '<DatePicker aria-label="C" defaultOpen open={false} onOpenChange={(open, details) => { void [open satisfies boolean, details.reason] }} container={null} />',
  noName: '<DatePicker />',
  dateObject: '<DatePicker aria-label="C" defaultValue={new Date()} />',
  numberDay: '<DatePicker aria-label="C" firstDayOfWeek="1" />',
  children: '<DatePicker aria-label="C">Today</DatePicker>',
  type: '<DatePicker aria-label="C" type="submit" />',
  render: '<DatePicker aria-label="C" render={<span />} />',
  hover: '<DatePicker aria-label="C" openOnHover />',
  tone: '<DatePicker aria-label="C" tone="danger" />',
  locale: '<DatePicker aria-label="C" locale="ar" />',
  badPlacement: '<DatePicker aria-label="C" placement="left" />',
  classFunction: "<DatePicker aria-label='C' className={() => 'p-4'} />",
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { DatePicker } from 'topclassui'")
    expect(SAMPLES[1]).toContain('<DatePicker id="check-in" name="checkIn"')
    expect(SAMPLES[2]).toContain('<DatePicker')
    expect(SAMPLES[2]).toContain('{...control}')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a DatePicker takes', () => {
  for (const name of ['byId', 'byAriaLabel', 'byLabelledBy', 'controlled', 'formProps', 'design', 'openState']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a DatePicker refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('no name (R-5.6-1)', () => { expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/) })

  it('a Date object for the value, and a string for the first day', () => {
    expect(said('dateObject')).toContain("Type 'Date' is not assignable")
    expect(said('numberDay')).toContain("Type 'string' is not assignable to type 'number'")
  })

  it('children, type, render and openOnHover', () => {
    expect(said('children')).toMatch(/children/)
    expect(said('type')).toContain("Property 'type' does not exist")
    expect(said('render')).toContain("Property 'render' does not exist")
    expect(said('hover')).toContain("Property 'openOnHover' does not exist")
  })

  it('a tone, a locale, a physical placement and a className function', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('locale')).toContain("Property 'locale' does not exist")
    expect(said('badPlacement')).toContain('Type \'"left"\' is not assignable')
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
  })
})
