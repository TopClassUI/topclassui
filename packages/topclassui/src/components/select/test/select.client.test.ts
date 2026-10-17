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

describe('the folder holds what Select needs and nothing else (R-8.1-1)', () => {
  it('a hook.ts and its lib.ts, and no boundaries, variants or skeleton: the one bound is the shared COLLECTION_BOUNDARIES', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts', 'meta.ts',
      'schema.ts', 'test', 'types.ts',
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
  const source = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [...importedNames(source, 'react'), ...memberHookCalls(source, namespaceNamesOf(source, 'react'))].filter(isHook)
    expect(hooks).toEqual([])
  })

  it('the one part calls one hook from hook.ts', () => {
    expect(hooksByPart(source)).toEqual({ Select: ['useSelect'] })
    expect(importedNames(source, './hook.js')).toEqual(['useSelect'])
  })

  it('takes Base UI from its select entry, the svg and the two icons by explicit import (R-7-1), and no schema', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/select'])
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.startsWith('#icons/'))).toEqual(['#icons/data/caret-down.js', '#icons/data/check.js'])
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('never hands Base UI a default: the hook holds the value', () => {
    expect(source).toContain('value={select.value}')
    expect(source).not.toMatch(/defaultValue=\{/)
  })

  it('keeps the shared bounds: the item never aligned over the trigger (docs/DECISIONS.md, 2026-09-21)', () => {
    expect(source).toContain('alignItemWithTrigger={false}')
    expect(source).toContain('sideOffset={FLOATING.sideOffset}')
    expect(source).toContain('collisionPadding={FLOATING.collisionPadding}')
  })
})

describe('hook.ts holds the value, the labels and the locale of the portal (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('builds on the shared form value, the Escape guard, the labels and the portal locale', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/clamp.js', '#shared/contracts/collection.js', '#shared/overlay.js', '#shared/provider/context.js',
      '#shared/provider/use-portal-locale.js', '#shared/use-form-value.js', './lib.js', './types.js',
    ])
    expect(hooksByPart(source)).toEqual({
      toPopupSelector: [],
      useSelect: ['useFormValue', 'useImperativeHandle', 'useRef', 'useImperativeHandle', 'useId', 'useLabels', 'usePortalLocale', 'useState', 'useEffect'],
    })
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  it('takes the field box, the holder, the rows and the popup from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual(expect.arrayContaining([
      'DISABLED', 'FIELD_BOX', 'FIELD_HOLDER', 'LABEL', 'LIST_CAP', 'OVERLAY_SURFACE', 'POPUP_BOUNDS', 'POPUP_MOTION', 'ROW', 'ROW_HIGHLIGHT',
      'ROW_SELECTED', 'ROW_TOUCH', 'SCROLL_AREA',
    ]))
  })

  it('names no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/\b(left|right)-|\b[mp][lr]-/)
  })
})
