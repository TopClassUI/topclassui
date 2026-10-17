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

describe('the folder holds what Checkbox needs and nothing else (R-8.1-1)', () => {
  it('a hook.ts and a skeleton, and no boundaries, lib or variants', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'meta.ts', 'schema.ts',
      'skeleton.tsx', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a server file can import it', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('is nothing but export-from lines, from client.tsx, skeleton.tsx and types.ts', () => {
    expect(nonReexports(source)).toEqual([])
    expect(importedModules(source).sort()).toEqual(['./client.js', './skeleton.js', './types.js'])
  })
})

describe('skeleton.tsx is a server file (R-5.7-3)', () => {
  const source = read('skeleton.tsx')

  it('has no use client and calls no hook, so a Server Component can render it as a fallback', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hooksByPart(source)).toEqual({ CheckboxSkeleton: [] })
  })

  it('imports nothing from client.tsx, hook.ts or Base UI, so no script ships with it', () => {
    expect(importedModules(source).filter((m) => m.includes('client') || m.includes('hook') || m.startsWith('@base-ui/'))).toEqual([])
  })
})

describe('client.tsx is the browser half (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [...importedNames(source, 'react'), ...memberHookCalls(source, namespaceNamesOf(source, 'react'))].filter(isHook)
    expect(hooks).toEqual([])
  })

  it('the one part calls one hook, useCheckbox, from hook.ts', () => {
    expect(hooksByPart(source)).toEqual({ Checkbox: ['useCheckbox'] })
    expect(importedNames(source, './hook.js')).toEqual(['useCheckbox'])
  })

  it('takes Base UI from its checkbox entry, the svg and two icons by explicit import (R-7-1), and no schema', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/checkbox'])
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.startsWith('#icons/'))).toEqual(['#icons/data/check.js', '#icons/data/minus.js'])
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('always renders a native button, and never hands Base UI a default: the hook holds the value', () => {
    expect(source).toContain('nativeButton\n')
    expect(source).toContain('render={<button />}')
    expect(source).toContain('checked={value.checked}')
    expect(source).not.toMatch(/defaultChecked=\{/)
  })

  it('the scan sees a bare hook, a member hook and use, and not a word that starts with use', () => {
    const probe = 'function A() { return f(useA(), X.useB(), use(p), user(), x.used()) }\nfunction B() { return 1 }\n'
    expect(hooksByPart(probe)).toEqual({ A: ['useA', 'useB', 'use'], B: [] })
  })
})

describe('hook.ts holds the value of the checkbox (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('builds on the shared form value, and takes only useImperativeHandle from React', () => {
    expect(importedModules(source)).toEqual(['react', '#shared/use-form-value.js', './constants.js', './types.js'])
    expect(importedNames(source, 'react')).toEqual(['useImperativeHandle'])
    expect(hooksByPart(source)).toEqual({ syncChecked: [], useCheckbox: ['useFormValue', 'useImperativeHandle'] })
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('classes.ts builds every string from the shared toggle constants (R-5.2-4)', () => {
  it('takes the target, the box, the checked fill, the invalid line and the sizes from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual([
      'FORCED_EDGE', 'TOGGLE_BOX', 'TOGGLE_INVALID', 'TOGGLE_ON', 'TOGGLE_SIZE', 'TOGGLE_TARGET', 'TOUCH_TARGET',
    ])
  })

  it('names no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/\b(left|right)-|\b[mp][lr]-/)
  })
})
