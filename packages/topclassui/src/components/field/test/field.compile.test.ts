import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'field')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `field-probe-${name}.tsx`))

/** The eleven controls a Field is shown with, imported as a page would. */
const CONTROLS = [
  "import { Input } from '#components/input/index.js'",
  "import { Textarea } from '#components/textarea/index.js'",
  "import { Switch } from '#components/switch/index.js'",
  "import { Checkbox } from '#components/checkbox/index.js'",
  "import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'",
  "import { SegmentedControlItem, SegmentedControlRoot } from '#components/segmented-control/index.js'",
  "import { Slider } from '#components/slider/index.js'",
  "import { NumberField } from '#components/number-field/index.js'",
  "import { OTPField } from '#components/otp-field/index.js'",
  "import { Select } from '#components/select/index.js'",
  "import { Combobox } from '#components/combobox/index.js'",
].join('\n')

const PRELUDE = `import { Field, FieldLive, type FieldControl, type FieldProps } from '../index.js'\n${CONTROLS}
export const used = [Field, FieldLive, Input, Textarea, Switch, Checkbox, RadioGroupItem, RadioGroupRoot, SegmentedControlItem, SegmentedControlRoot, Slider, NumberField, OTPField, Select, Combobox]
export type Used = [FieldControl, FieldProps]
const ITEMS = [{ value: 'a', label: 'A' }]
export const items = ITEMS`

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Field, FieldLive]\n`
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
/** One Field around one control: the control object spread as it is, and nothing else the control needs for a name. */
const around = (control: string) => `<Field name="n" label="L" hint="H" error="E" required>{(control) => ${control}}</Field>`

const verdict = compile({
  readmeImport: sample(0),
  readmeSample: sample(1),
  readmeLive: sample(2),
  input: around('<Input {...control} type="email" />'),
  textarea: around('<Textarea {...control} />'),
  switch: around('<Switch {...control} />'),
  checkbox: around('<Checkbox {...control} />'),
  radioGroup: around('<RadioGroupRoot {...control}><RadioGroupItem value="a">A</RadioGroupItem></RadioGroupRoot>'),
  segmented: around('<SegmentedControlRoot {...control} defaultValue="a"><SegmentedControlItem value="a">A</SegmentedControlItem></SegmentedControlRoot>'),
  slider: around('<Slider {...control} />'),
  numberField: around('<NumberField {...control} />'),
  otpField: around('<OTPField {...control} />'),
  select: around('<Select {...control} items={items} />'),
  combobox: around('<Combobox {...control} items={items} />'),
  live: '<FieldLive name="n" label="L" inline invalid={false}>{(control) => <Checkbox {...control} />}</FieldLive>',
  root: '<Field name="n" label="L" className="mt-2" style={{ gap: 4 }} data-x="1" ref={(node: HTMLDivElement | null) => { void node }} onClick={() => undefined}>{(control) => <Input {...control} />}</Field>',
  elementChild: '<Field name="n" label="L"><Input id="x" /></Field>',
  textChild: '<Field name="n" label="L">Email</Field>',
  noChild: '<Field name="n" label="L" />',
  noName: '<Field label="L">{(control) => <Input {...control} />}</Field>',
  noLabel: '<Field name="n">{(control) => <Input {...control} />}</Field>',
  numberError: '<Field name="n" label="L" error={3}>{(control) => <Input {...control} />}</Field>',
  size: '<Field name="n" label="L" size="lg">{(control) => <Input {...control} />}</Field>',
  rootId: '<Field name="n" label="L" id={3}>{(control) => <Input {...control} />}</Field>',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line, the server sample and the client sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { Field, FieldLive } from 'topclassui/field'")
    expect(SAMPLES[1]).toContain('{(control) => <Input {...control}')
    expect(SAMPLES[2]).toContain('<FieldLive')
  })

  for (const name of ['readmeImport', 'readmeSample', 'readmeLive']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('one control object spreads onto each of the eleven controls with no change to them', () => {
  for (const name of ['input', 'textarea', 'switch', 'checkbox', 'radioGroup', 'segmented', 'slider', 'numberField', 'otpField', 'select', 'combobox']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }

  it('FieldLive takes the same, and the root takes className, style, data, a div ref and listeners', () => {
    expect([verdict['live'], verdict['root']]).toEqual([[], []])
  })
})

describe('what a Field refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a child that is not a function: an element, text or none (choice 8)', () => {
    expect(said('elementChild')).toContain("is not assignable to type '(control: FieldControl) => ReactNode'")
    expect(said('textChild')).toContain("'Field' components don't accept text as child elements")
    expect(said('noChild')).toContain("Property 'children' is missing")
  })

  it('no name and no label', () => {
    expect(said('noName')).toMatch(/name/)
    expect(said('noLabel')).toMatch(/label/)
  })

  it('an error that is not text, a size, which is not built, and an id that is not a string', () => {
    expect(said('numberError')).toContain("Type 'number' is not assignable")
    expect(said('size')).toContain("Property 'size' does not exist")
    expect(said('rootId')).toContain("Type 'number' is not assignable to type 'string'")
  })
})
