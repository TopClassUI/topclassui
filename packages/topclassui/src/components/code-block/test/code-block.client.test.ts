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

describe('the folder holds what CodeBlock needs and nothing else (R-8.1-1)', () => {
  it('the files the plan lists: no boundaries, no lib, no variants, no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'meta.ts', 'schema.ts', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx is the server half (R-5.1-1)', () => {
  const source = read('index.tsx')

  it('has no use client, so a Server Component renders the block itself', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('calls useId and no other hook, never imports hook.ts, and imports the button from client.tsx', () => {
    expect(hooksByPart(source)).toEqual({ CodeBlock: ['useId'] })
    expect(importedModules(source)).not.toContain('./hook.js')
    expect(importedModules(source)).toContain('./client.js')
  })

  it('imports schema.ts nowhere, so zod never reaches a page (R-8.3-1)', () => {
    for (const file of ['index.tsx', 'client.tsx', 'hook.ts']) expect(importedModules(read(file)), file).not.toContain('./schema.js')
  })
})

describe('client.tsx is markup plus one hook call (R-5.12-1)', () => {
  it('starts with use client, as hook.ts does', () => {
    expect(hasUseClient(read('client.tsx'))).toBe(true)
    expect(hasUseClient(read('hook.ts'))).toBe(true)
  })

  it('CodeBlockCopy calls useCodeBlockCopy and nothing else', () => {
    expect(hooksByPart(read('client.tsx'))).toEqual({ CodeBlockCopy: ['useCodeBlockCopy'] })
  })

  it('the hook makes the id, holds the result and the count of presses, and clears its timer on unmount', () => {
    expect(hooksByPart(read('hook.ts'))).toEqual({ useCodeBlockCopy: ['useId', 'useState', 'useState', 'useRef', 'useEffect'] })
  })
})
