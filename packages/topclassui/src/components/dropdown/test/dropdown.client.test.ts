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

describe('the folder holds what Dropdown needs and nothing else (R-8.1-1)', () => {
  it('a hook.ts, a lib.ts, a boundaries.ts and two part files, and no variants or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'parts', 'schema.ts', 'test', 'types.ts',
    ])
    expect(readdirSync(join(FOLDER, 'parts')).sort()).toEqual(['dropdown-group-label.tsx', 'dropdown-row.tsx'])
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a server file can import it', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('is nothing but export-from lines, from client.tsx and types.ts, so it cannot render or call anything', () => {
    expect(nonReexports(source)).toEqual([])
    expect(importedModules(source).sort()).toEqual(['./client.js', './types.js'])
  })

  it('the scan sees a function, a constant and an import as not re-exports', () => {
    const probe = "import { x } from './y.js'\nexport function A() { return null }\nconst b = 1\nexport { c } from './c.js'\n"
    expect(nonReexports(probe)).toEqual(['ImportDeclaration', 'FunctionDeclaration', 'FirstStatement'])
  })
})

describe('client.tsx is the browser half (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports Fragment from React and no hook, named or through a namespace', () => {
    expect(importedNames(source, 'react')).toEqual(['Fragment'])
    expect(memberHookCalls(source, namespaceNamesOf(source, 'react')).filter(isHook)).toEqual([])
  })

  // Read part by part: eight functions share the file, and each one is markup plus at most one hook of its own.
  it('each part calls at most one hook: the root for its scope, the positioner for its locale, the menu for its scope and its tab stop, the data-driven menu for its handler', () => {
    expect(hooksByPart(source)).toEqual({
      DropdownRoot: ['useDropdownRoot'],
      DropdownTrigger: [],
      DropdownPopup: ['useDropdownPositioner'],
      DropdownSurface: ['useDropdownPopup'],
      DropdownItem: [],
      DropdownLinkItem: [],
      DropdownGroup: [],
      DropdownSeparator: [],
      DropdownMenu: ['useDropdownMenu'],
    })
  })

  it('takes its four hooks and the scope context from hook.ts, and calls no hook from anywhere else', () => {
    expect(importedNames(source, './hook.js')).toEqual(['DropdownScopeContext', 'useDropdownMenu', 'useDropdownPopup', 'useDropdownPositioner', 'useDropdownRoot'])
    expect(hookCallsIn(parse(source)).sort()).toEqual(['useDropdownMenu', 'useDropdownPopup', 'useDropdownPositioner', 'useDropdownRoot'])
  })

  it('imports neither the provider nor its locale hook itself: both reach the popup through hook.ts', () => {
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual([])
  })

  it('takes its pure helpers from src/shared and imports them, never a copy', () => {
    expect(importedNames(source, '#shared/overlay.js')).toEqual(['guardEscape'])
    expect(importedNames(source, '#shared/render-trigger.js')).toEqual(['renderTrigger'])
    expect(importedNames(source, '#shared/floating.js')).toEqual(['FLOATING', 'toSideAlign'])
    expect(importedNames(source, '#shared/clamp.js')).toEqual(['clamp'])
    expect(importedModules(source).filter((m) => m.startsWith('./')).sort()).toEqual([
      './boundaries.js', './classes.js', './constants.js', './hook.js', './lib.js', './parts/dropdown-group-label.js', './parts/dropdown-row.js',
      './types.js',
    ])
  })

  it('takes Base UI from its menu entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/menu'])
  })

  it('imports no component at all, Dialog and Popover least of all. And no schema, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual([])
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('never names a physical side: the positioner takes what toSideAlign returns', () => {
    expect(source).not.toMatch(/side=["'{]+(left|right)/)
    expect(source).toContain('side={side}')
  })

  // The root-part lint reads DropdownGroup as the root of a DropdownGroupLabel declared in the same file.
  it('declares DropdownGroup and re-exports DropdownGroupLabel from its part file, so both names stand', () => {
    expect(Object.keys(hooksByPart(source))).not.toContain('DropdownGroupLabel')
    expect(source).toContain('export { DropdownGroupLabel }')
  })

  it('the scan sees a bare hook, a member hook and use, a second call in one part, and not a word that starts with use', () => {
    const probe = 'function A() { return f(useA(), X.useB(), use(p), user(), x.used()) }\nfunction B() { return 1 }\nconst c = useC()\n'
    expect(hooksByPart(probe)).toEqual({ A: ['useA', 'useB', 'use'], B: [] })
    expect(hookCallsIn(parse(probe))).toEqual(['useA', 'useB', 'use', 'useC'])
  })
})

describe('the part file', () => {
  const source = read('parts/dropdown-group-label.tsx')

  it("starts with 'use client', exports one component named after the file, and calls no hook", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(hooksByPart(source)).toEqual({ DropdownGroupLabel: [] })
  })

  it('takes Base UI from its menu entry, its class from classes.ts and its props from types.ts', () => {
    expect(importedModules(source)).toEqual(['@base-ui/react/menu', '#shared/cn.js', '../classes.js', '../types.js'])
  })
})

