import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'file-upload')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `file-upload-probe-${name}.tsx`))

const PRELUDE = "import { FileUpload, type FileUploadProps } from '../index.js'\nexport const used = [FileUpload]\nexport type Used = FileUploadProps"

/** The import line compiles as one that uses what it imports, a client module as a module, and any other sample as JSX. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [FileUpload]\n`
  if (code.startsWith("'use client'")) return `${code.split('\n')[0] ?? ''}\n${PRELUDE}\n${code.split('\n').slice(1).join('\n')}\n`
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
  byLabel: '<FileUpload id="docs" />',
  byAriaLabel: '<FileUpload aria-label="Docs" />',
  byLabelledBy: '<FileUpload aria-labelledby="docs-label" />',
  formProps: '<FileUpload aria-label="A" name="a" accept=".pdf" form="f" required disabled autoFocus data-probe="x" onBlur={() => undefined} />',
  limits: '<FileUpload aria-label="A" maxFiles={5} maxSize={5 * 1024 * 1024} visibleRows={3} invalid />',
  handler: '<FileUpload aria-label="A" onValueChange={(files) => { void (files satisfies readonly File[]) }} />',
  root: "<FileUpload aria-label=\"A\" className=\"mt-2\" style={{ maxWidth: 320 }} ref={(node: HTMLDivElement | null) => { void node }}>Hint</FileUpload>",
  fieldProps: 'export function field(control: { id: string, name: string, required: boolean, \'aria-labelledby\': string, \'aria-describedby\': string | undefined, \'aria-invalid\': true | undefined }) { return <FileUpload {...control} /> }',
  noName: '<FileUpload />',
  onlyTitle: '<FileUpload title="Docs" />',
  multiple: '<FileUpload aria-label="A" multiple />',
  value: '<FileUpload aria-label="A" value="a.pdf" />',
  onChange: '<FileUpload aria-label="A" onChange={() => undefined} />',
  size: '<FileUpload aria-label="A" size="md" />',
  stringMax: '<FileUpload aria-label="A" maxSize="10MB" />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { FileUpload } from 'topclassui/file-upload'")
    expect(SAMPLES[1]).toContain('encType="multipart/form-data"')
    expect(SAMPLES[2]).toContain('onValueChange')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeSecond']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a FileUpload takes', () => {
  for (const name of ['byLabel', 'byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the native form props, which reach the input', () => { expect(verdict['formProps']).toEqual([]) })
  it('the limits, as numbers', () => { expect(verdict['limits']).toEqual([]) })
  it('onValueChange, with the kept files', () => { expect(verdict['handler']).toEqual([]) })
  it('a className, a style and a ref to the root div', () => { expect(verdict['root']).toEqual([]) })
  it('the control object a Field hands it, spread as it is', () => { expect(verdict['fieldProps']).toEqual([]) })
})

describe('what a FileUpload refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('an upload with no name, or named by a title alone (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyTitle')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('multiple, a value, the native onChange and a size: maxFiles, the browser and onValueChange own them', () => {
    expect(said('multiple')).toContain("Property 'multiple' does not exist")
    expect(said('value')).toContain("Property 'value' does not exist")
    expect(said('onChange')).toContain("Property 'onChange' does not exist")
    expect(said('size')).toContain("Property 'size' does not exist")
  })

  it('a size written as text: the prop is bytes', () => {
    expect(said('stringMax')).toContain("Type 'string' is not assignable to type 'number'")
  })
})
