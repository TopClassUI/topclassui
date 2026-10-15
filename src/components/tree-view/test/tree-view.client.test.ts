import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

const parse = (source: string) => ts.createSourceFile('client.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)

/** Every top-level statement that is not an `export ... from` line, as its syntax kind. */
function nonReexports(source: string): string[] {
  return parse(source).statements
    .filter((node) => !(ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined))
    .map((node) => ts.SyntaxKind[node.kind])
}

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

describe('the folder holds what TreeView needs and nothing else (R-8.1-1)', () => {
  it('a hook.ts and a lib.ts, and no boundaries (the bounds are shared), variants, skeleton or parts', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts', 'meta.ts', 'schema.ts',
      'test', 'types.ts',
    ])
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a server file can import it', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('is nothing but export-from lines, from client.tsx and types.ts', () => {
    expect(nonReexports(source)).toEqual([])
    expect(importedModules(source).sort()).toEqual(['./client.js', './types.js'])
  })
})

describe('client.tsx is the browser half (R-5.12-1)', () => {
  const client = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(client.startsWith("'use client'\n")).toBe(true)
  })

  it('imports no React hook, named or through a namespace, and calls one hook from hook.ts', () => {
    const hooks = [...importedNames(client, 'react'), ...memberHookCalls(client, namespaceNamesOf(client, 'react'))].filter(isHook)
    expect(hooks).toEqual([])
    expect(hooksByPart(client)).toEqual({ TreeView: ['useTreeView'] })
    expect(importedNames(client, './hook.js')).toEqual(['useTreeView'])
  })

  it('takes no Base UI part, the svg and the two carets by explicit import (R-7-1), and no schema', () => {
    expect(importedModules(client).filter((m) => m.startsWith('@base-ui/'))).toEqual([])
    expect(importedModules(client).filter((m) => m.startsWith('#icons/'))).toEqual(['#icons/data/caret-down.js', '#icons/data/caret-right.js'])
    expect(importedModules(client).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(client).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('swaps the caret, never rotates it (PLAN 5.3)', () => {
    expect(client).toContain('icon={row.open ? caretDown : caretRight}')
    expect(client).not.toMatch(/rotate/)
  })
})

describe('hook.ts holds the state, the window and the keys (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('builds on the shared collection, controllable state, direction and labels', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/clamp.js', '#shared/collection/use-collection.js', '#shared/contracts/collection.js',
      '#shared/provider/context.js', '#shared/use-controllable-state.js', './constants.js', './lib.js', './types.js',
    ])
    expect(hooksByPart(source)).toEqual({
      useTreeView: [
        'useControllableState', 'useControllableState', 'useMemo', 'useState', 'useState', 'useState', 'useRef', 'useRef',
        'useRef', 'useRef', 'useRef', 'useRef', 'useImperativeHandle', 'useCallback', 'useCollection', 'useCallback',
        'useCallback', 'useLayoutEffect', 'useDirection', 'useLabels', 'useId',
      ],
    })
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('lib.ts and classes.ts', () => {
  it('lib.ts imports no React', () => {
    expect(importedModules(read('lib.ts'))).toEqual(['./types.js'])
  })

  it('classes.ts takes the line, the hover, the label, the scroll area and the transition from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual(['BORDER', 'HOVER', 'LABEL', 'SCROLL_AREA', 'TRANSITION'])
  })

  it('classes.ts names no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/\b(left|right)-|\b[mp][lr]-/)
  })
})
