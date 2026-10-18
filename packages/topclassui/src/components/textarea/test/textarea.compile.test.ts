import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'textarea')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `textarea-probe-${name}.tsx`))

const PRELUDE = "import { Textarea, TextareaSkeleton, type TextareaProps } from '../index.js'\nexport const used = [Textarea, TextareaSkeleton]\nexport type Used = TextareaProps"

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Textarea, TextareaSkeleton]\n`
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
  readmeSample: sample(1),
  byLabel: '<Textarea id="bio" />',
  byAriaLabel: '<Textarea aria-label="Bio" />',
  byLabelledBy: '<Textarea aria-labelledby="bio-label" />',
  native: '<Textarea aria-label="A" name="a" required minLength={2} form="f" readOnly disabled dir="auto" wrap="hard" placeholder="p" defaultValue="d" />',
  controlled: '<Textarea aria-label="A" value="x" onChange={(event) => { void (event.target.value satisfies string) }} />',
  fieldProps: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <Textarea {...control} /> }',
  design: '<Textarea aria-label="A" size="xl" invalid fullWidth rows={4} maxRows={8} autosize showCount maxLength={null} className="ms-2" ref={(node: HTMLTextAreaElement | null) => { void node }} />',
  skeleton: '<TextareaSkeleton size="lg" fullWidth rows={5} className="ms-2" />',
  noName: '<Textarea />',
  onlyTitle: '<Textarea title="Bio" />',
  children: '<Textarea aria-label="A">Hello</Textarea>',
  rowsString: '<Textarea aria-label="A" rows="3" />',
  capString: '<Textarea aria-label="A" maxLength="500" />',
  variant: '<Textarea aria-label="A" variant="outline" />',
  badSize: '<Textarea aria-label="A" size="xxl" />',
  divRef: '<Textarea aria-label="A" ref={(node: HTMLDivElement | null) => { void node }} />',
  skeletonChildren: '<TextareaSkeleton>Loading</TextareaSkeleton>',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the sample, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toContain("import { Textarea, TextareaSkeleton } from 'topclassui/textarea'")
    expect(SAMPLES[1]).toContain('<label htmlFor="bio">')
  })

  for (const name of ['readmeImport', 'readmeSample']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a Textarea takes', () => {
  for (const name of ['byLabel', 'byAriaLabel', 'byLabelledBy', 'native', 'controlled', 'design', 'skeleton']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the five props a Field will hand it, spread as they are', () => {
    expect(verdict['fieldProps']).toEqual([])
  })
})

describe('what a Textarea refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a textarea with no name, or named by a title alone (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyTitle')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('children as its value: the value is value or defaultValue', () => {
    expect(said('children')).toMatch(/children/)
  })

  it('rows and the cap as strings, a variant, which is not built, and a size outside the six', () => {
    expect(said('rowsString')).toContain("Type 'string' is not assignable to type 'number'")
    expect(said('capString')).toContain("Type 'string' is not assignable to type 'number'")
    expect(said('variant')).toContain("Property 'variant' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
  })

  it('a ref to another element, and children in a skeleton', () => {
    expect(said('divRef')).toContain('HTMLTextAreaElement')
    expect(said('skeletonChildren')).toMatch(/children/)
  })
})
