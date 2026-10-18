import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importsFromRepo } from '#test/samples.js'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'form')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `form-probe-${name}.tsx`))

/** What a page that pastes a sample has imported already: the README's own import line names only this folder. */
const IMPORTS = [
  "import { Form, FormAction, type FormActionState } from '../index.js'",
  "import { Field, FieldLive } from '#components/field/index.js'",
  "import { Input } from '#components/input/index.js'",
  "import { Button } from '#components/button/index.js'",
  'export const used = [Form, FormAction, Field, FieldLive, Input, Button]',
  'export interface Stepped extends FormActionState { values?: { email?: string }, step: number }',
  'export type Used = FormActionState',
].join('\n')

/** The import line compiles as one that uses what it imports; a module as it is; any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${importsFromRepo(code)}\nexport const imported = [Form, FormAction]\nexport type Imported = FormActionState\n`
  if (code.startsWith("'use client'") || code.startsWith('export ')) return `${IMPORTS}\n${code}\n`
  return `${IMPORTS}\ndeclare function subscribe(formData: FormData): Promise<void>\nexport const sample = (\n<>\n${code}\n</>\n)\n`
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
const ACT = 'action={async (state: Stepped) => ({ ...state, step: state.step + 1 })}'

const verdict = compile({
  readmeImport: sample(0),
  readmeServer: sample(1),
  readmeClient: sample(2),
  url: '<Form action="/subscribe" method="post" encType="multipart/form-data" target="_self" noValidate className="grid" ref={(node: HTMLFormElement | null) => { void node }} />',
  serverAction: '<Form action={async (formData: FormData) => { void formData }}><Input aria-label="Email" name="email" /></Form>',
  inferred: `<FormAction ${ACT} initialState={{ step: 1 }} permalink="/subscribe" aria-label="F" noValidate>{(state, pending) => <p>{state.step}{String(pending)}{state.values?.email}</p>}</FormAction>`,
  plain: '<FormAction action={(state: FormActionState) => state}><p>Fields</p></FormAction>',
  noAction: '<FormAction><p>Fields</p></FormAction>',
  noInitial: `<FormAction ${ACT} />`,
  wrongAnswer: '<FormAction action={(state: Stepped) => state.step} initialState={{ step: 1 }} />',
  noErrorsKey: '<FormAction action={(state: { message?: string }) => state} />',
  method: '<FormAction action={(state: FormActionState) => state} method="post" />',
  encType: '<FormAction action={(state: FormActionState) => state} encType="multipart/form-data" />',
  formChildFunction: '<Form>{() => null}</Form>',
  divRef: '<Form ref={(node: HTMLDivElement | null) => { void node }} />',
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the two samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(3)
    expect(SAMPLES[0]).toContain("import { Form, FormAction, type FormActionState } from 'topclassui/form'")
    expect(SAMPLES[1]).toContain('<Form action={subscribe}')
    expect(SAMPLES[2]).toContain('<FormAction action={subscribe}')
  })

  for (const name of ['readmeImport', 'readmeServer', 'readmeClient']) {
    it(`${name} compiles`, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what Form and FormAction take', () => {
  for (const name of ['url', 'serverAction', 'inferred', 'plain']) {
    it(name, () => { expect(verdict[name]).toEqual([]) })
  }
})

describe('what they refuse', () => {
  const said = (name: string) => (verdict[name] ?? []).join(' ')

  it('a FormAction with no action, or with no initialState when a key of the state is required', () => {
    expect(said('noAction')).toContain("Property 'action' is missing")
    expect(said('noInitial')).toContain("Property 'initialState' is missing")
  })

  it('an action that answers with something that is not the state, or a state that shares no key with FormActionState', () => {
    expect(said('wrongAnswer')).toContain("Type 'number' is not assignable")
    expect(said('noErrorsKey')).toContain("Type 'FormActionState' has no properties in common with type '{ message?: string | undefined; }'")
  })

  it('method and encType on a FormAction, which React writes itself for a function action', () => {
    expect(said('method')).toContain("Property 'method' does not exist")
    expect(said('encType')).toContain("Property 'encType' does not exist")
  })

  it('a function child on a server Form, and a ref to another element', () => {
    expect(said('formChildFunction')).toMatch(/is not assignable to type 'ReactNode'/)
    expect(said('divRef')).toContain('HTMLFormElement')
  })
})
