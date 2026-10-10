import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'dialog')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `dialog-probe-${name}.tsx`))

/** What a page that pastes a sample has in scope: the nine parts, Button, Input and its own Server Actions. */
const PRELUDE = [
  "import { Button } from '../../button/index.js'",
  "import { Input } from '../../input/index.js'",
  'import {',
  '  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,',
  '  DialogTrigger,',
  "} from '../index.js'",
  'declare function renameProject(data: FormData): Promise<void>',
  'declare function publishSite(data: FormData): Promise<void>',
  'export const used = [Button, Input, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup,',
  '  DialogRoot, DialogTitle, DialogTrigger, renameProject, publishSite]',
].join('\n')

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`]))

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

/** Every tsx block a reader can copy out of the hand-written half of the README, in order. */
function readmeSamples(): string[] {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
}

const SAMPLES = readmeSamples()

const verdict = compile({
  readmeFirst: SAMPLES[0] ?? '<Missing />',
  readmeSecond: SAMPLES[1] ?? '<Missing />',
  // The sample of the docs card: it type-checks, which is why the README has to say not to write it.
  formOnPopup: '<DialogRoot><DialogPopup render={<form action={publishSite} />}><DialogBody>Body</DialogBody></DialogPopup></DialogRoot>',
  confirm: '<DialogRoot disablePointerDismissal><DialogPopup size="xs"><DialogHeader closeButton={false} /></DialogPopup></DialogRoot>',
  controlled: '<DialogRoot open onOpenChange={(open, details) => { void [open, details.reason] }}><DialogPopup /></DialogRoot>',
  bodyFocus: '<DialogRoot><DialogPopup lang="ar"><DialogBody tabIndex={0}>Text</DialogBody></DialogPopup></DialogRoot>',
  badSize: '<DialogRoot><DialogPopup size="huge" /></DialogRoot>',
  rootClass: '<DialogRoot className="p-4"><DialogPopup /></DialogRoot>',
  badCloseButton: '<DialogRoot><DialogPopup><DialogHeader closeButton="no" /></DialogPopup></DialogRoot>',
  dismissible: '<DialogRoot dismissible={false}><DialogPopup /></DialogRoot>',
  classFunction: "<DialogRoot><DialogPopup className={() => 'p-4'} /></DialogRoot>",
  sizeOnHeader: '<DialogRoot><DialogPopup><DialogHeader size="lg" /></DialogPopup></DialogRoot>',
})

describe('the samples in the README compile as written', () => {
  it('finds both samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toContain('<DialogTitle>Publish changes</DialogTitle>')
    expect(SAMPLES[1]).toContain('<form action={renameProject} className="contents">')
  })

  it('the first sample: a header, a body and a footer with two ways out', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })

  it('the second sample: a form with a Server Action around the three bars', () => {
    expect(verdict['readmeSecond']).toEqual([])
  })
})

describe('what a Dialog does take', () => {
  it('a confirm: disablePointerDismissal on the root, a size and no x', () => {
    expect(verdict['confirm']).toEqual([])
  })

  it('a controlled dialog, whose handler reads the reason it was asked to close', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('a body the keyboard can reach and a popup with its own language', () => {
    expect(verdict['bodyFocus']).toEqual([])
  })

  it('a form as the popup itself, because render passes to Base UI: valid TypeScript, invalid ARIA', () => {
    expect(verdict['formOnPopup']).toEqual([])
  })
})

describe('what a Dialog does not take', () => {
  it('refuses a size outside the scale', () => {
    expect((verdict['badSize'] ?? []).join(' ')).toContain('Type \'"huge"\' is not assignable')
  })

  it('refuses a className on the root, which renders no element', () => {
    expect((verdict['rootClass'] ?? []).join(' ')).toContain("Property 'className' does not exist")
  })

  it('refuses a closeButton that is not a boolean', () => {
    expect((verdict['badCloseButton'] ?? []).join(' ')).toContain("Type 'string' is not assignable to type 'boolean")
  })

  it('refuses dismissible, which is not built: pass disablePointerDismissal', () => {
    expect((verdict['dismissible'] ?? []).join(' ')).toContain("Property 'dismissible' does not exist")
  })

  it('refuses the state function Base UI takes as a className, so cn() always has a string', () => {
    expect((verdict['classFunction'] ?? []).join(' ')).toContain("is not assignable to type 'string'")
  })

  it('refuses a size on the header, which follows the popup', () => {
    expect((verdict['sizeOnHeader'] ?? []).join(' ')).toContain("Property 'size' does not exist")
  })
})
