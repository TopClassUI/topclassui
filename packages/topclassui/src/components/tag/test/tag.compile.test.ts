import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'tag')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `tag-probe-${name}.tsx`))

/** A whole module is compiled as written; a line of JSX inside a module that imports both exports. */
function wrap(code: string): string {
  if (code.startsWith("'use client'")) return code.replace("'topclassui'", "'../index.js'")
  return `import { Tag, TagRemovable } from '../index.js'\nexport const both = [Tag, TagRemovable]\nexport const sample = (\n<>\n${code}\n</>\n)\n`
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

/** The client module the README tells a reader to copy: the one code block that is a whole file. */
function readmeSample(): string {
  const readme = readFileSync(join(FOLDER, 'README.md'), 'utf8')
  const hand = readme.slice(readme.indexOf('<!-- hand-written -->'), readme.indexOf('<!-- /hand-written -->'))
  return [...hand.matchAll(/```tsx?\r?\n([\s\S]*?)```/g)].map((match) => match[1] ?? '').find((code) => code.startsWith("'use client'")) ?? ''
}

const SAMPLE = readmeSample()

const verdict = compile({
  readme: SAMPLE,
  handler: '<TagRemovable onRemove={() => undefined}>React</TagRemovable>',
  asyncHandler: '<TagRemovable onRemove={async () => { await Promise.resolve() }}>React</TagRemovable>',
  withLook: '<TagRemovable tone="danger" size="xs" onRemove={() => undefined}>React</TagRemovable>',
  notAFunction: '<TagRemovable onRemove="remove">React</TagRemovable>',
  noHandler: '<TagRemovable>React</TagRemovable>',
  onTag: '<Tag onRemove={() => undefined}>React</Tag>',
  removable: '<Tag removable>React</Tag>',
  disabled: '<TagRemovable disabled onRemove={() => undefined}>React</TagRemovable>',
})

describe('the README sample compiles as written', () => {
  it('finds the client module, so an empty extraction cannot pass', () => {
    expect(SAMPLE).toContain("import { TagRemovable } from 'topclassui'")
    expect(SAMPLE).toContain('<TagRemovable onRemove={() => { remove(topic, index) }}>{topic}</TagRemovable>')
  })

  it('moves the focus to the next x, or the one before, before the tag leaves the list', () => {
    expect(SAMPLE.replace(/\r\n/g, '\n')).toContain([
      '    const next = buttons?.[index + 1] ?? buttons?.[index - 1]',
      '    next?.focus()',
      '    setTopics(topics.filter((other) => other !== topic))',
    ].join('\n'))
  })

  it('compiles: a client component that owns the list', () => {
    expect(verdict['readme']).toEqual([])
  })
})

describe('what onRemove takes', () => {
  it('a handler, an async one too, beside the look', () => {
    expect([verdict['handler'], verdict['asyncHandler'], verdict['withLook']]).toEqual([[], [], []])
  })

  it('refuses a string', () => {
    expect((verdict['notAFunction'] ?? []).join(' ')).toContain("Type 'string' is not assignable")
  })

  it('is required by TagRemovable and refused by Tag, which takes no function (R-5.1-3)', () => {
    expect((verdict['noHandler'] ?? []).join(' ')).toContain("Property 'onRemove' is missing")
    expect((verdict['onTag'] ?? []).join(' ')).toContain("Property 'onRemove' does not exist")
  })

  it('refuses removable and disabled, which are not built', () => {
    expect((verdict['removable'] ?? []).join(' ')).toContain("Property 'removable' does not exist")
    expect((verdict['disabled'] ?? []).join(' ')).toContain("Property 'disabled' does not exist")
  })
})
