import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'tag')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `tag-probe-${name}.tsx`))

/** A whole module is compiled as written; a line of JSX inside a module that imports Tag. */
function wrap(code: string): string {
  if (code.startsWith("'use client'")) return code.replace("'topclassui'", "'../index.js'")
  return `import { Tag } from '../index.js'\nexport const sample = (\n<>\n${code}\n</>\n)\n`
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
  handler: '<Tag onRemove={() => undefined}>React</Tag>',
  asyncHandler: '<Tag onRemove={async () => { await Promise.resolve() }}>React</Tag>',
  withLook: '<Tag tone="danger" size="xs" onRemove={() => undefined}>React</Tag>',
  notAFunction: '<Tag onRemove="remove">React</Tag>',
  removable: '<Tag removable>React</Tag>',
  disabled: '<Tag disabled onRemove={() => undefined}>React</Tag>',
})

describe('the README sample compiles as written', () => {
  it('finds the client module, so an empty extraction cannot pass', () => {
    expect(SAMPLE).toContain("import { Tag } from 'topclassui'")
    expect(SAMPLE).toContain('<Tag onRemove={() => { setTopics(topics.filter((other) => other !== topic)) }}>{topic}</Tag>')
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

  it('refuses removable and disabled, which are not built', () => {
    expect((verdict['removable'] ?? []).join(' ')).toContain("Property 'removable' does not exist")
    expect((verdict['disabled'] ?? []).join(' ')).toContain("Property 'disabled' does not exist")
  })
})
