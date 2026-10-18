import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'otp-field')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `otp-field-probe-${name}.tsx`))

const PRELUDE = [
  "import { OTPField, type OTPFieldProps } from '../index.js'",
  'export const used = [OTPField]',
  'export type Used = OTPFieldProps',
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [OTPField]\n`
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
  byId: '<OTPField id="code" />',
  byLabelledBy: '<OTPField aria-labelledby="code-label" />',
  controlled: '<OTPField id="c" value="12" onValueChange={(next, details) => { void [next satisfies string, details.reason, details.cancel] }} />',
  baseProps: '<OTPField id="c" name="code" defaultValue="1" form="f" required readOnly disabled autoSubmit mask validationType="alphanumeric" inputMode="text" normalizeValue={(v) => v.toUpperCase()} onValueComplete={(v) => { void v }} onValueInvalid={(v) => { void v }} />',
  design: '<OTPField id="c" length={8} size="xl" invalid groupSize={4} className="gap-4" aria-describedby="hint" aria-invalid ref={(node: HTMLDivElement | null) => { void node }} />',
  noName: '<OTPField />',
  byAriaLabel: '<OTPField aria-label="Code" />',
  idAndAriaLabel: '<OTPField id="c" aria-label="Code" />',
  oldName: "import { OtpField } from '../index.js'\nexport const wrong = OtpField",
  tone: '<OTPField id="c" tone="danger" />',
  badSize: '<OTPField id="c" size="xxl" />',
  stringLength: '<OTPField id="c" length="6" />',
  numberValue: '<OTPField id="c" value={12} />',
  classFunction: "<OTPField id=\"c\" className={() => 'p-4'} />",
  wrongRef: '<OTPField id="c" ref={(node: HTMLButtonElement | null) => { void node }} />',
  badType: '<OTPField id="c" validationType="hex" />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { OTPField } from 'topclassui/otp-field'")
    expect(SAMPLES[1]).toContain('<OTPField id="code" name="code" aria-describedby="code-hint" />')
    expect(SAMPLES[2]).toContain('<OTPField {...control} length={6} />')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what an OTPField takes', () => {
  for (const name of ['byId', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the controlled pair, whose handler reads a string and the details', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('every form and code prop of Base UI', () => {
    expect(verdict['baseProps']).toEqual([])
  })

  it('length, size, invalid, groupSize, a className, a hint, aria-invalid and a ref to the group', () => {
    expect(verdict['design']).toEqual([])
  })
})

describe('what an OTPField refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a field with no name (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('an aria-label, alone or beside an id: Base UI drops it on the first cell', () => {
    expect(said('byAriaLabel')).toMatch(/is not assignable to type 'IntrinsicAttributes|Type 'string' is not assignable to type 'undefined'/)
    expect(said('idAndAriaLabel')).toMatch(/is not assignable to type 'IntrinsicAttributes|Type 'string' is not assignable to type 'undefined'/)
  })

  it('OtpField, the folder\'s spelling, which is not an export (choice 24)', () => {
    expect(said('oldName')).toContain("has no exported member named 'OtpField'")
  })

  it('a tone, which is not built, a size outside the six, a length written as a string, a value that is a number', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
    expect(said('stringLength')).toContain("Type 'string' is not assignable to type 'number'")
    expect(said('numberValue')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('a className function, a ref to another element, and a validation type Base UI does not know', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('wrongRef')).toContain('HTMLDivElement')
    expect(said('badType')).toContain('Type \'"hex"\' is not assignable')
  })
})
