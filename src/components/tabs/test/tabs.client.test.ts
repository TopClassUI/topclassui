import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

/** Every top-level statement that is not an `export ... from` line, as its syntax kind. */
function nonReexports(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)
  return file.statements
    .filter((node) => !(ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined))
    .map((node) => ts.SyntaxKind[node.kind])
}

const isHook = (name: string) => name === 'use' || /^use[A-Z]/.test(name)

/** The callee name of every call that reads as a hook, bare or on an object, from any module. */
function hookCalls(source: string): string[] {
  const out: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : ''
      if (isHook(name)) out.push(name)
    }
    ts.forEachChild(node, visit)
  }
  visit(ts.createSourceFile('client.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX))
  return out
}

/** The hooks each exported function of a file calls, by the function's name. */
function hooksPerFunction(source: string): Record<string, string[]> {
  const file = ts.createSourceFile('client.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const out: Record<string, string[]> = {}
  for (const node of file.statements) {
    if (ts.isFunctionDeclaration(node) && node.name) out[node.name.text] = hookCalls(node.getText(file))
  }
  return out
}

describe('the folder is a split component: client parts behind an index a server file imports', () => {
  it('holds exactly the files Tabs needs: no lib, since Base UI holds the state, and no variants or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx',
      'meta.ts', 'schema.ts', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a Server Component page can import the parts and write their panels', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('is nothing but export-from lines, so it cannot render or call anything', () => {
    expect(nonReexports(source)).toEqual([])
  })

  it('takes the parts from client.tsx and the types from types.ts, and nothing else', () => {
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

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [
      ...importedNames(source, 'react'),
      ...memberHookCalls(source, namespaceNamesOf(source, 'react')),
    ].filter(isHook)
    expect(hooks).toEqual([])
  })

  it('each part calls at most one hook, its own, from hook.ts: the panel calls none', () => {
    expect(hooksPerFunction(source)).toEqual({
      TabsRoot: ['useTabsRoot'],
      TabsList: ['useTabsLook'],
      TabsTab: ['useTabsTab'],
      TabsPanel: [],
    })
    expect(importedNames(source, './hook.js').sort()).toEqual(['TabsLookContext', 'useTabsLook', 'useTabsRoot', 'useTabsTab'])
  })

  it('the call scan sees a bare hook, a member hook and use, and not a word that starts with use', () => {
    expect(hookCalls('f(useA(), X.useB(), use(p), user(), x.used())')).toEqual(['useA', 'useB', 'use'])
  })

  // Not a portal: the direction reaches Base UI through the DirectionProvider that TopClassProvider mounts.
  it('imports nothing from the provider: Base UI reads the direction of the arrow keys itself', () => {
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual([])
    expect(importedModules(read('hook.ts')).filter((m) => m.includes('provider'))).toEqual([])
  })

  it('takes Base UI from its tabs entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/tabs'])
  })

  it('imports the schema with nothing at runtime, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('imports no other component: a panel holds whatever its caller renders', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual([])
  })
})

describe('hook.ts holds the context that carries the look, and the tab stop of the server HTML (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports React, the defaults and a type, and no Base UI: which tab is active stays with Base UI', () => {
    expect(importedModules(source).sort()).toEqual(['./constants.js', './types.js', 'react'])
    expect(importedNames(source, 'react').sort()).toEqual(['createContext', 'useContext', 'useMemo', 'useState', 'useSyncExternalStore'])
  })

  it('the root keeps the value it opens on and memoizes what it provides; a list and a tab read it', () => {
    expect(hooksPerFunction(source)).toEqual({
      useTabsRoot: ['useState', 'useMemo'],
      useTabsLook: ['useContext'],
      useTabsTab: ['useContext', 'useSyncExternalStore'],
    })
  })

  // An effect would run after the first paint: the store answers during the render that hydrates.
  it('uses no effect to learn that the page has hydrated', () => {
    expect(hookCalls(source).filter((name) => name.endsWith('Effect'))).toEqual([])
  })

  // check-boundaries reads `<Letter` in hook.ts as JSX, so a type argument is never written there.
  it('writes no type argument in angle brackets', () => {
    expect(source.match(/<[A-Za-z]/g)).toBeNull()
  })
})
