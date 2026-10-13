import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'dialog')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `dialog-probe-${name}.tsx`))

/** The nine parts, by the names the README imports them under. */
const PARTS = 'DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger'

/** What a page that pastes a sample has in scope: the nine parts, Button, Input and its own Server Actions. */
const PRELUDE = [
  "import { Button } from '../../button/index.js'",
  "import { Input } from '../../input/index.js'",
  `import { ${PARTS} } from '../index.js'`,
  'declare function renameProject(data: FormData): Promise<void>',
  'declare function publishSite(data: FormData): Promise<void>',
  '/** Answers with an error message, or with none. */',
  'declare function saveName(data: FormData): Promise<string | null>',
  `export const used = [Button, Input, ${PARTS}, renameProject, publishSite, saveName]`,
].join('\n')

/** A sample that is a whole client file compiles as a module, the import line as one that uses
 * what it imports, and any other sample as JSX, the way a page would paste it. */
function wrap(code: string): string {
  if (code.startsWith("'use client'")) {
    return `${PRELUDE}\nimport { useActionState, useState } from 'react'\nexport const hooks = [useActionState, useState]\n${code}\n`
  }
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [${PARTS}]\n`
  return `${PRELUDE}\nexport const sample = (\n<>\n${code}\n</>\n)\n`
}

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
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
const dialog = (root: string, popup: string, inside = '') => `<DialogRoot${root}><DialogPopup${popup}>${inside}</DialogPopup></DialogRoot>`

const verdict = compile({
  readmeImport: sample(0),
  readmeFirst: sample(1),
  readmeSecond: sample(2),
  readmeThird: sample(3),
  // The sample of the docs card: it type-checks, which is why the README has to say not to write it.
  formOnPopup: dialog('', ' render={<form action={publishSite} />}', '<DialogBody>Body</DialogBody>'),
  confirm: dialog(' disablePointerDismissal', ' size="xs"', '<DialogHeader closeButton={false} />'),
  confirmThatActs: dialog('', '', '<form action={publishSite} className="contents"><DialogFooter>'
    + '<DialogClose render={<Button type="submit" tone="danger">Delete</Button>} /></DialogFooter></form>'),
  controlled: dialog(' open onOpenChange={(open, details) => { void [open, details.reason] }}', ''),
  bodyFocus: dialog('', ' lang="ar"', '<DialogBody tabIndex={0}>Text</DialogBody>'),
  modalValues: `<>${dialog(' modal', '')}${dialog(' modal={false}', '')}${dialog(' modal="trap-focus"', '')}</>`,
  portal: dialog('', ' keepMounted container={null} finalFocus={() => document.body}'),
  linkTrigger: '<DialogRoot><DialogTrigger nativeButton={false} render={<span role="button">Open</span>} /></DialogRoot>',
  badSize: dialog('', ' size="huge"'),
  badModal: dialog(' modal="half"', ''),
  rootClass: dialog(' className="p-4"', ''),
  rootHandle: dialog(' handle={undefined}', ''),
  badCloseButton: dialog('', '', '<DialogHeader closeButton="no" />'),
  dismissible: dialog(' dismissible={false}', ''),
  classFunction: dialog('', " className={() => 'p-4'}"),
  sizeOnHeader: dialog('', '', '<DialogHeader size="lg" />'),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the three samples, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(4)
    expect(SAMPLES[0]).toContain("} from 'topclassui'")
    expect(SAMPLES[1]).toContain('<DialogTitle>Publish changes</DialogTitle>')
    expect(SAMPLES[2]).toContain('<form action={renameProject} className="contents">')
    expect(SAMPLES[3]).toContain('<DialogRoot open={open} onOpenChange={setOpen}>')
  })

  it('the import line names nine exports that exist, where the generated one names a Dialog that does not', () => {
    expect(verdict['readmeImport']).toEqual([])
  })

  it('the first sample: a header, a body and a footer with two ways out', () => {
    expect(verdict['readmeFirst']).toEqual([])
  })

  it('the second sample: a form with a Server Action around the three bars', () => {
    expect(verdict['readmeSecond']).toEqual([])
  })

  it('the third sample: a client file that closes on success and shows the error otherwise', () => {
    expect(verdict['readmeThird']).toEqual([])
  })
})

describe('what a Dialog does take', () => {
  it('a confirm: disablePointerDismissal on the root, a size and no x', () => {
    expect(verdict['confirm']).toEqual([])
  })

  it('a confirm that acts: a submit Button as the close, inside a form', () => {
    expect(verdict['confirmThatActs']).toEqual([])
  })

  it('a controlled dialog, whose handler reads the reason it was asked to close', () => {
    expect(verdict['controlled']).toEqual([])
  })

  it('a body the keyboard can reach and a popup with its own language', () => {
    expect(verdict['bodyFocus']).toEqual([])
  })

  it('each of the three values of modal', () => {
    expect(verdict['modalValues']).toEqual([])
  })

  it('where its portal mounts, whether it stays mounted, and a function for the last focus', () => {
    expect(verdict['portal']).toEqual([])
  })

  it('a trigger that is not a button, with nativeButton={false}', () => {
    expect(verdict['linkTrigger']).toEqual([])
  })

  it('a form as the popup itself, because render passes to Base UI: valid TypeScript, invalid ARIA', () => {
    expect(verdict['formOnPopup']).toEqual([])
  })
})

describe('what a Dialog does not take', () => {
  it('refuses a fourth value of modal', () => {
    expect((verdict['badModal'] ?? []).join(' ')).toContain('Type \'"half"\' is not assignable')
  })

  it('refuses a handle on the root: nothing exported can create one', () => {
    expect((verdict['rootHandle'] ?? []).join(' ')).toContain("Property 'handle' does not exist")
  })

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
