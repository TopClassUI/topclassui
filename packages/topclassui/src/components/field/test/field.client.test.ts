import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules } from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

const parse = (source: string) => ts.createSourceFile('client.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)

const isHook = (name: string) => name === 'use' || /^use[A-Z]/.test(name)

/** The callee name of every call under a node that reads as a hook, bare or on an object. */
function hookCallsIn(root: ts.Node): string[] {
  const out: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : ''
      if (isHook(name)) out.push(name)
    }
    ts.forEachChild(node, visit)
  }
  visit(root)
  return out
}

/** The hooks each top-level function of a file calls, by the function's name, in source order. */
function hooksByPart(source: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const node of parse(source).statements) {
    if (ts.isFunctionDeclaration(node) && node.name) out[node.name.text] = hookCallsIn(node)
  }
  return out
}

describe('the folder holds what Field needs and nothing else (R-8.1-1)', () => {
  it('the files the plan lists: lib.ts, one part, no boundaries, no variants, no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts', 'meta.ts', 'parts', 'schema.ts', 'test', 'types.ts',
    ])
    expect(readdirSync(join(FOLDER, 'parts'))).toEqual(['field-frame.tsx'])
  })
})

describe('index.tsx is the server half (R-5.1-1)', () => {
  const source = read('index.tsx')

  it('has no use client, so a Server Component renders the field itself', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('calls useId and no other hook, and never imports hook.ts', () => {
    expect(hooksByPart(source)).toEqual({ Field: ['useId'] })
    expect(importedModules(source)).not.toContain('./hook.js')
    expect(importedModules(source)).toContain('./parts/field-frame.js')
  })
})

describe('client.tsx is markup plus one hook call (R-5.12-1)', () => {
  it('client.tsx and hook.ts start with use client', () => {
    expect([hasUseClient(read('client.tsx')), hasUseClient(read('hook.ts'))]).toEqual([true, true])
  })

  it('FieldLive calls useFieldLive and nothing else', () => {
    expect(hooksByPart(read('client.tsx'))).toEqual({ FieldLive: ['useFieldLive'] })
  })
})

describe('the frame part is shared by both halves, and lib.ts is pure', () => {
  const source = read('parts/field-frame.tsx')

  it('has no use client and calls no hook, so the server half may render FieldFrame', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(Object.values(hooksByPart(source)).flat()).toEqual([])
  })

  it('imports no React hook and nothing of the client half', () => {
    expect(importedModules(source).filter((name) => name === '../hook.js' || name === '../client.js' || name.startsWith('react'))).toEqual([])
  })

  it('lib.ts imports nothing from React and draws nothing', () => {
    expect(importedModules(read('lib.ts')).filter((name) => name.startsWith('react') || name.startsWith('#components/'))).toEqual([])
  })
})
