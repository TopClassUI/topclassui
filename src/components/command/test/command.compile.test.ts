import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'command')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `command-probe-${name}.tsx`))

/** What a client file that pastes the sample has in scope: Command, Button, useState and a router. */
const PRELUDE = [
  "import { useState } from 'react'",
  "import { Button } from '../../button/index.js'",
  "import { Command } from '../index.js'",
  'declare const router: { push: (href: string) => void }',
  'export const used = [useState, Button, Command, router]',
].join('\n')

/** The import line as a module that uses what it imports; anything else after the prelude. */
function wrap(code: string): string {
  if (code.startsWith('import ')) return `${code.replace("'topclassui'", "'../index.js'")}\nexport const imported = [Command]\n`
  return `${PRELUDE}\n${code.replace("'use client'", '')}\n`
}

/** The compiler's verdict, read at runtime, so a mutation can reach it. Only the probes are roots. */
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

/** Every code block of the hand-written half of the README, in order. */
const SAMPLES = (() => {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '')
})()

const palette = (extra: string) => `export const probe = <Command items={[{ id: 'a', label: 'A' }]} getKey={(c) => c.id} getLabel={(c) => c.label} onSelect={() => undefined}${extra} />`

const verdict = compile({
  readmeImport: SAMPLES[0] ?? '',
  readmeSample: SAMPLES[1] ?? '',
  everyProp: palette(" getGroup={(c) => c.id} renderItem={(c) => <b>{c.label}</b>} visibleRows={5} virtualize shortcut={null} status=\"loading\" emptyFallback=\"None\" loadingFallback=\"Wait\" defaultOpen className=\"p-4\" id=\"palette\" finalFocus={() => document.body} keepMounted container={null}"),
  noGetLabel: "export const probe = <Command items={[{ id: 'a' }]} getKey={(c) => c.id} onSelect={() => undefined} />",
  wrongItem: palette(' renderItem={(c) => c.missing}'),
  loadMore: palette(' loadMore={() => undefined}'),
  childrenGiven: palette(' children="x"'),
  classFunction: palette(" className={() => 'p-4'}"),
  badVirtualize: palette(' virtualize="always"'),
  statusError: palette(' status="error"'),
  statusMore: palette(' status="loading-more"'),
  statusEmpty: palette(' status="empty"'),
})

describe('the samples in the README compile as written', () => {
  it('finds the import line and the client file, so an empty extraction cannot pass', () => {
    expect(SAMPLES).toHaveLength(2)
    expect(SAMPLES[0]).toBe("import { Command } from 'topclassui'\n")
    expect(SAMPLES[1]).toContain('onOpenChange={setOpen}')
  })

  it('the import line and the client file have no error', () => {
    expect(verdict['readmeImport']).toEqual([])
    expect(verdict['readmeSample']).toEqual([])
  })
})

describe('what Command takes', () => {
  it('every prop the README names, Base UI popup props among them', () => {
    expect(verdict['everyProp']).toEqual([])
  })

  it('refuses a palette without getLabel, a row that reads what an item lacks, and loadMore, which is not built', () => {
    expect(verdict['noGetLabel']?.join(' ')).toContain("Property 'getLabel' is missing")
    expect(verdict['wrongItem']?.join(' ')).toContain("Property 'missing' does not exist")
    expect(verdict['loadMore']?.join(' ')).toContain("Property 'loadMore' does not exist")
  })

  it('refuses children, a className function and a virtualize that is not auto or a boolean', () => {
    expect(verdict['childrenGiven']).not.toEqual([])
    expect(verdict['classFunction']).not.toEqual([])
    expect(verdict['badVirtualize']).not.toEqual([])
  })

  it('refuses status error and loading-more, which it cannot draw, and takes empty', () => {
    expect(verdict['statusError']?.join(' ')).toContain('"error"')
    expect(verdict['statusMore']?.join(' ')).toContain('"loading-more"')
    expect(verdict['statusEmpty']).toEqual([])
  })
})
