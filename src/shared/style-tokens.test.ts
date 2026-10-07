import { join } from 'node:path'
import type { CSSProperties } from 'react'

import ts from 'typescript'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type {} from './style-tokens.js'

const ROOT = process.cwd()

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')

/**
 * The compiler's own verdict on a snippet, read at runtime. Type assertions erase before
 * Vitest runs, so without this `pnpm test:mutation` could delete the augmentation unseen.
 */
function errorsIn(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [slash(join(ROOT, 'src', 'shared', `style-token-probe-${name}.tsx`)), code]))

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

  const roots = [...probes.keys(), slash(join(ROOT, 'src', 'shared', 'style-tokens.ts'))]
  const program = ts.createProgram(roots, options, host)
  const out: Record<string, string[]> = {}
  for (const [name] of Object.entries(snippets)) {
    const file = program.getSourceFile(slash(join(ROOT, 'src', 'shared', `style-token-probe-${name}.tsx`)))
    out[name] = ts.getPreEmitDiagnostics(program, file)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  }
  return out
}

describe('style may carry a --tc-* variable, and nothing else', () => {
  it('types a --tc-* key as a string or a number', () => {
    expectTypeOf<CSSProperties['--tc-progress-value']>().toEqualTypeOf<string | number | undefined>()
  })

  it('still refuses a custom property outside the --tc- prefix', () => {
    // @ts-expect-error: only --tc-* is declared, so any other custom property stays an error.
    const outside: CSSProperties = { '--other': '1' }
    expect(outside).toBeDefined()
  })

  const verdict = errorsIn({
    token: "export const ok = <div style={{ '--tc-progress-value': '40%' }} />",
    number: "export const ok = <div style={{ '--tc-list-rows': 3 }} />",
    other: "export const bad = <div style={{ '--other': '1' }} />",
    property: "export const bad = <div style={{ '--tc-x': {} }} />",
  })

  it('compiles a --tc-* key in a real style attribute, which is what Progress writes', () => {
    expect(verdict['token']).toEqual([])
  })

  it('compiles a number too, which a row count or a ratio needs', () => {
    expect(verdict['number']).toEqual([])
  })

  it('rejects any other custom property, so the prefix is a real fence', () => {
    expect((verdict['other'] ?? []).join(' ')).toContain("'--other'")
  })

  it('rejects a value that is neither a string nor a number', () => {
    // The message, not a count: a program that fails for any other reason also has errors.
    expect((verdict['property'] ?? []).join(' ')).toContain('string | number | undefined')
  })
})
