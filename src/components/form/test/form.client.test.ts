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

describe('the folder holds what Form needs and nothing else (R-8.1-1)', () => {
  it('the files the plan lists: no schema, no classes, no boundaries, no lib, no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'meta.ts', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx is the server half (R-5.1-1)', () => {
  const source = read('index.tsx')

  it('has no use client, so a Server Component renders the form itself', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('calls no hook, never imports hook.ts, and re-exports the client half', () => {
    expect(hooksByPart(source)).toEqual({ Form: [] })
    expect(importedModules(source)).not.toContain('./hook.js')
    expect(source).toContain("export { FormAction } from './client.js'")
  })
})

describe('client.tsx is markup plus one hook call (R-5.12-1)', () => {
  it('starts with use client', () => {
    expect(hasUseClient(read('client.tsx'))).toBe(true)
  })

  it('FormAction calls useFormAction and nothing else', () => {
    expect(hooksByPart(read('client.tsx'))).toEqual({ FormAction: ['useFormAction'] })
  })

  it('the hook is a client file that calls useActionState, the one React piece that holds the answer', () => {
    expect(hasUseClient(read('hook.ts'))).toBe(true)
    expect(hooksByPart(read('hook.ts'))['useFormAction']).toEqual(['useActionState', 'useRef', 'useRef', 'useEffect', 'useCallback'])
  })
})
