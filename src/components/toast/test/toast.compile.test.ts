import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'toast')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `toast-probe-${name}.tsx`))

/** The copy-paste sample is a client file of its own: what a page has in scope is Button and toast. */
const PRELUDE = "import { Button } from '../../button/index.js'\nimport { toast } from '../index.js'\n"

function wrap(code: string): string {
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [toast]\n`
  return `${code.replace("'use client'\n", `'use client'\n${PRELUDE}`)}\nexport const scope = [Button, toast]\n`
}

/** The compiler's verdict, read at runtime, with only the probes as roots, as in a consumer's own program. */
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

const verdict = compile({
  readmeImport: SAMPLES[0] ?? '<Missing />',
  readmeSample: SAMPLES[1] ?? '<Missing />',
  // A tone outside the six is refused, and so is a function as the label of the action.
  badTone: "'use client'\nexport const id = toast.add({ title: 'Saved', tone: 'purple' })\n",
  badAction: "'use client'\nexport const id = toast.add({ title: 'Archived', action: { label: () => 'Undo', onClick: () => undefined } })\n",
  // R-5.6-1: a toast is a dialog named by its title, so add() refuses one with none; update() changes only what it names.
  noTitle: "'use client'\nexport const id = toast.add({ description: 'Saved two minutes ago.' })\n",
  emptyTitles: "'use client'\nexport const ids = [toast.add({}), toast.add({ title: null }), toast.add({ title: undefined }), toast.add({ title: false })]\n",
  partialUpdate: "'use client'\ntoast.update('upload', { description: 'Two of three files.' })\nexport const done = toast.promise(Promise.resolve(1), { loading: 'Saving', success: { title: 'Saved', duration: 0 }, error: 'Failed' })\n",
  steps: "'use client'\nexport const done = toast.promise(Promise.resolve(2), { loading: 'Wait', success: (n) => `${String(n)} done`, error: { title: 'Failed', duration: 0 } })\n",
})

describe('the README', () => {
  it('holds the import line and one sample, and both compile against the real exports', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(verdict['readmeImport']).toEqual([])
    expect(verdict['readmeSample']).toEqual([])
  })

  it('the types refuse a tone outside the six and a label that is not text', () => {
    expect(verdict['badTone']?.join(' ')).toContain('"purple"')
    expect(verdict['badAction']?.length).toBeGreaterThan(0)
  })

  it('add() refuses a toast with no title, which would be a dialog with no name (TOAST-6)', () => {
    expect(verdict['noTitle']?.join(' ')).toContain("Property 'title' is missing")
    expect(verdict['emptyTitles']).toHaveLength(4)
  })

  it('update() takes only what it changes, and a promise step its title', () => {
    expect(verdict['partialUpdate']).toEqual([])
  })

  it('a promise takes a title, a function of its value and the options as its steps', () => {
    expect(verdict['steps']).toEqual([])
  })
})
