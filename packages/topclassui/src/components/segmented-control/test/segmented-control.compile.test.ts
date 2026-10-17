import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'segmented-control')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `segmented-control-probe-${name}.tsx`))

const PRELUDE = [
  "import { SegmentedControlItem, SegmentedControlRoot, type SegmentedControlItemProps, type SegmentedControlRootProps } from '../index.js'",
  'export const used = [SegmentedControlItem, SegmentedControlRoot]',
  'export type Used = [SegmentedControlItemProps, SegmentedControlRootProps]',
].join('\n')

/** The import line and a client file compile as a page would paste them, an export after the import, and any other
 * sample as JSX. */
function wrap(code: string): string {
  const local = importsFromRepo(code)
  if (code.startsWith('import ')) return `${local}\nexport const imported = [SegmentedControlItem, SegmentedControlRoot]\n`
  if (code.startsWith("'use client'")) return local
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
const ITEMS = '<SegmentedControlItem value="a">A</SegmentedControlItem>'
const ROOT_OK = 'aria-label="V" defaultValue="a"'

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeField: sample(2),
  byAriaLabel: `<SegmentedControlRoot aria-label="View" defaultValue="a">${ITEMS}</SegmentedControlRoot>`,
  byLabelledBy: `<SegmentedControlRoot aria-labelledby="view-label" defaultValue="a">${ITEMS}</SegmentedControlRoot>`,
  controlled: `<SegmentedControlRoot aria-label="V" value="a" onValueChange={(next, details) => { void [next satisfies string, details.reason, details.cancel] }}>${ITEMS}</SegmentedControlRoot>`,
  formProps: `<SegmentedControlRoot ${ROOT_OK} name="v" form="f" required readOnly disabled inputRef={{ current: null }}>${ITEMS}</SegmentedControlRoot>`,
  design: `<SegmentedControlRoot ${ROOT_OK} size="xl" fullWidth invalid className="ms-2" ref={(node: HTMLDivElement | null) => { void node }}>${ITEMS}</SegmentedControlRoot>`,
  itemProps: '<SegmentedControlItem value="a" icon={<svg />} disabled readOnly id="a" className="ms-2" style={{ marginBlock: 4 }} inputRef={{ current: null }} ref={(node: HTMLButtonElement | null) => { void node }}>A</SegmentedControlItem>',
  noName: `<SegmentedControlRoot defaultValue="a">${ITEMS}</SegmentedControlRoot>`,
  onlyId: `<SegmentedControlRoot id="view" defaultValue="a">${ITEMS}</SegmentedControlRoot>`,
  noValue: `<SegmentedControlRoot aria-label="V">${ITEMS}</SegmentedControlRoot>`,
  fieldNoLabel: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <SegmentedControlRoot {...control} defaultValue="a" /> }',
  itemNoValue: '<SegmentedControlItem>A</SegmentedControlItem>',
  numberValue: '<SegmentedControlItem value={1}>A</SegmentedControlItem>',
  numberHandler: `<SegmentedControlRoot ${ROOT_OK} onValueChange={(value) => { const wrong: number = value; void wrong }}>${ITEMS}</SegmentedControlRoot>`,
  nativeButton: '<SegmentedControlItem value="a" nativeButton={false}>A</SegmentedControlItem>',
  render: '<SegmentedControlItem value="a" render={<span />}>A</SegmentedControlItem>',
  tone: `<SegmentedControlRoot ${ROOT_OK} tone="neutral">${ITEMS}</SegmentedControlRoot>`,
  orientation: `<SegmentedControlRoot ${ROOT_OK} orientation="vertical">${ITEMS}</SegmentedControlRoot>`,
  badSize: `<SegmentedControlRoot ${ROOT_OK} size="xxl">${ITEMS}</SegmentedControlRoot>`,
  itemSize: '<SegmentedControlItem value="a" size="sm">A</SegmentedControlItem>',
  classFunction: "<SegmentedControlItem value=\"a\" className={() => 'p-4'}>A</SegmentedControlItem>",
  itemRef: '<SegmentedControlItem value="a" ref={(node: HTMLInputElement | null) => { void node }}>A</SegmentedControlItem>',
  rootRef: `<SegmentedControlRoot ${ROOT_OK} ref={(node: HTMLButtonElement | null) => { void node }}>${ITEMS}</SegmentedControlRoot>`,
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'")
    expect(SAMPLES[1]).toContain('<SegmentedControlRoot value={view} onValueChange={setView} aria-label="View">')
    expect(SAMPLES[2]).toContain('<SegmentedControlRoot {...control} aria-labelledby=')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a SegmentedControl takes', () => {
  for (const name of ['byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('the controlled pair, whose handler reads a string and the details', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('every form prop of Base UI on the track', () => {
    expect(verdict['formProps']).toEqual([])
  })

  it('size, fullWidth, invalid, a className and a ref to the track', () => {
    expect(verdict['design']).toEqual([])
  })

  it('a segment: an icon, disabled, readOnly, an id, a class, a style, inputRef and a ref to its button', () => {
    expect(verdict['itemProps']).toEqual([])
  })
})

describe('what a SegmentedControl refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a track with no name, or with an id alone, which no label can point at (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyId')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('a track with neither value nor defaultValue: one segment is always selected', () => {
    expect(said('noValue')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('the five props of a Field without aria-labelledby beside them', () => {
    expect(said('fieldNoLabel')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('a segment with no value, or a value that is not a string', () => {
    expect(said('itemNoValue')).toContain("Property 'value' is missing")
    expect(said('numberValue')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('a number read out of onValueChange: the value is a string, never any', () => {
    expect(said('numberHandler')).toContain("Type 'string' is not assignable to type 'number'")
  })

  it('nativeButton and render on a segment: it is always our button', () => {
    expect(said('nativeButton')).toContain("Property 'nativeButton' does not exist")
    expect(said('render')).toContain("Property 'render' does not exist")
  })

  it('a tone and an orientation, which are not built, a size outside the six, a size on a segment', () => {
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('orientation')).toContain("Property 'orientation' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
    expect(said('itemSize')).toContain("Property 'size' does not exist")
  })

  it('the state function Base UI takes as a className, and a ref to another element', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('itemRef')).toContain('HTMLButtonElement')
    expect(said('rootRef')).toContain('HTMLDivElement')
  })
})
