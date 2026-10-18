import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'slider')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `slider-probe-${name}.tsx`))

const PRELUDE = [
  "import { useState } from 'react'",
  "import { Slider, type SliderProps, type SliderValue } from '../index.js'",
  'export const used = [Slider, useState]',
  'export type Used = [SliderProps, SliderValue]',
].join('\n')

/** The import line compiles as one that uses what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Slider]\n`
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

/** A component body, so a sample can hold the state its setter comes from. */
const holding = (state: string, jsx: string) => `export function Probe() {\n  ${state}\n  return ${jsx}\n}`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeField: sample(2),
  byAriaLabel: '<Slider aria-label="Volume" />',
  byLabelledBy: '<Slider aria-labelledby="volume-label" />',
  setNumber: holding('const [volume, setVolume] = useState(60)', '<Slider aria-label="V" value={volume} onValueChange={setVolume} />'),
  setPair: holding('const [price, setPrice] = useState<readonly [number, number]>([20, 80])', '<Slider aria-label="P" value={price} onValueChange={setPrice} />'),
  pairDefault: '<Slider aria-label="P" defaultValue={[20, 80]} onValueChange={(next, details) => { void [next[0] satisfies number, next[1] satisfies number, details.activeThumbIndex, details.cancel] }} />',
  formProps: '<Slider aria-label="V" name="v" form="f" defaultValue={5} min={0} max={10} step={0.5} largeStep={2} disabled required orientation="horizontal" />',
  design: '<Slider aria-label="V" size="xl" invalid fullWidth showValue className="ms-2" format={{ style: \'percent\' }} locale="ar" ref={(node: HTMLDivElement | null) => { void node }} />',
  noName: '<Slider />',
  onlyId: '<Slider id="volume" />',
  fieldNoLabel: 'export function field(control: { id: string, name: string, required: boolean, \'aria-describedby\': string, \'aria-invalid\': boolean }) { return <Slider {...control} /> }',
  setPairOnNumber: holding('const [price, setPrice] = useState<readonly [number, number]>([20, 80])', '<Slider aria-label="P" defaultValue={5} onValueChange={setPrice} />'),
  setNumberOnPair: holding('const [volume, setVolume] = useState(60)', '<Slider aria-label="V" defaultValue={[20, 80]} onValueChange={setVolume} />'),
  threeThumbs: '<Slider aria-label="V" defaultValue={[1, 2, 3]} />',
  stringValue: '<Slider aria-label="V" defaultValue="5" />',
  thumbAlignment: '<Slider aria-label="V" thumbAlignment="edge" />',
  readOnly: '<Slider aria-label="V" readOnly />',
  tone: '<Slider aria-label="V" tone="danger" />',
  badSize: '<Slider aria-label="V" size="xxl" />',
  classFunction: "<Slider aria-label=\"V\" className={() => 'p-4'} />",
  wrongRef: '<Slider aria-label="V" ref={(node: HTMLButtonElement | null) => { void node }} />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { Slider } from 'topclassui/slider'")
    expect(SAMPLES[1]).toContain('<Slider aria-labelledby="price-label" name="price" defaultValue={[20, 80]} showValue />')
    expect(SAMPLES[2]).toContain('<Slider {...control} aria-labelledby=')
  })

  for (const name of ['readmeImport', 'readmeFirst', 'readmeField']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what a Slider takes', () => {
  for (const name of ['byAriaLabel', 'byLabelledBy']) {
    it(`a name: ${name}`, () => { expect(verdict[name]).toEqual([]) })
  }

  it('a setter of a number on one thumb, and a setter of a pair on a range, handed straight to onValueChange', () => {
    expect(verdict['setNumber']).toEqual([])
    expect(verdict['setPair']).toEqual([])
  })

  it('a pair default gives a handler that reads two numbers and the index of the thumb that moved', () => {
    expect(verdict['pairDefault']).toEqual([])
  })

  it('every form prop of Base UI, and required, which a Field spreads', () => {
    expect(verdict['formProps']).toEqual([])
  })

  it('size, invalid, fullWidth, showValue, a format, a locale, a className and a ref to the group', () => {
    expect(verdict['design']).toEqual([])
  })
})

describe('what a Slider refuses', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a slider with no name, or with an id alone, which reaches the group and not the input (R-5.6-1)', () => {
    expect(said('noName')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
    expect(said('onlyId')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('the five props of a Field without aria-labelledby beside them', () => {
    expect(said('fieldNoLabel')).toMatch(/is not assignable to type 'IntrinsicAttributes/)
  })

  it('a setter of a pair on one thumb, and a setter of a number on a range', () => {
    expect(said('setPairOnNumber')).toContain('is not assignable')
    expect(said('setNumberOnPair')).toContain('is not assignable')
  })

  it('three thumbs, and a value that is not a number', () => {
    expect(said('threeThumbs')).toContain('is not assignable')
    expect(said('stringValue')).toContain('is not assignable')
  })

  it('thumbAlignment, a readOnly Base UI does not have, a tone, a size outside the six', () => {
    expect(said('thumbAlignment')).toContain("Property 'thumbAlignment' does not exist")
    expect(said('readOnly')).toContain("Property 'readOnly' does not exist")
    expect(said('tone')).toContain("Property 'tone' does not exist")
    expect(said('badSize')).toContain('Type \'"xxl"\' is not assignable')
  })

  it('the state function Base UI takes as a className, and a ref to another element', () => {
    expect(said('classFunction')).toContain("is not assignable to type 'string'")
    expect(said('wrongRef')).toContain('HTMLDivElement')
  })
})
