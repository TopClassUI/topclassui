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

describe('the folder holds what FileUpload needs and nothing else (R-8.1-1)', () => {
  it('a hook, a lib and the bounds, and no variants, parts or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'schema.ts', 'test', 'types.ts',
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

  it('the one part calls one hook, useFileUpload, from hook.ts', () => {
    expect(hooksByPart(source)).toEqual({ FileUpload: ['useFileUpload'] })
    expect(importedNames(source, './hook.js')).toEqual(['useFileUpload'])
  })

  it('imports no Base UI, no other component but Svg, and no schema, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual([])
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('takes each icon by its own import (R-7-1)', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#icons/'))).toEqual([
      '#icons/data/file.js', '#icons/data/upload-simple.js', '#icons/data/warning-circle.js', '#icons/data/x.js',
    ])
  })

  it('a native file input with its role-less list beside it: no hand-written multiple, and the type fixed', () => {
    expect(source).toContain('type="file"')
    expect(source).toContain('multiple={upload.multiple}')
    expect(source).toContain('<ul role="list"')
  })
})

describe('hook.ts holds the list (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('builds on the shared form value, the scroll tab stop and the provider', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/clamp.js', '#shared/collection/use-collection.js', '#shared/contracts/collection.js',
      '#shared/provider/context.js', '#shared/render-trigger.js', '#shared/use-form-value.js', '#shared/use-scroll-tab-stop.js',
      './boundaries.js', './constants.js', './lib.js', './types.js',
    ])
    expect(hooksByPart(source)).toEqual({
      writeFiles: [],
      syncFiles: [],
      announceWrite: [],
      useFileUpload: [
        'useFormValue', 'useImperativeHandle', 'useRef', 'useScrollTabStop', 'useState', 'useCollectionDefaults', 'useCollection',
        'useCallback', 'useLabels', 'useNumberFormat', 'useLocale', 'useId',
        'useRef', 'useRef', 'useRef', 'useState', 'useRef', 'useEffect', 'useLayoutEffect',
      ],
    })
  })

  it('dispatches input after a scripted write, never change', () => {
    expect(source).toContain("new Event('input', { bubbles: true })")
    expect(source).not.toContain("new Event('change'")
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('lib.ts is pure', () => {
  it('imports no React and nothing but the constants and the types', () => {
    expect(importedModules(read('lib.ts'))).toEqual(['./constants.js', './types.js'])
  })
})

describe('classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  it('takes the lines, the rings, the invalid mark, the row floor, the scroll area and the icon button from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual([
      'BORDER', 'BORDER_STRONG', 'CONTAIN', 'DISABLED', 'FIELD_INVALID_WITHIN', 'FOCUS_RING_INSET', 'FOCUS_RING_WITHIN', 'HOVER', 'ICON_BUTTON', 'LABEL',
      'ROW_TOUCH', 'SCROLL_AREA', 'TRANSITION',
    ])
  })

  it('names no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/\b(left|right)-|\b[mp][lr]-/)
  })
})
