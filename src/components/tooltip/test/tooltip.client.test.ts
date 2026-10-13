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

// The first client folder in the repo, so the half of the contract no gate checks yet is read here.
describe('the folder is the client template', () => {
  // hook.ts arrived with the direction: a portal sits in <body>, so the popup must be told the provider's.
  it('holds exactly the files Tooltip needs: a hook.ts for the direction and no lib, since Base UI holds the state', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx',
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

  it('calls one hook and no other: its own, from hook.ts, for the direction a portaled popup cannot inherit', () => {
    expect(hookCalls(source)).toEqual(['useTooltipPopup'])
    expect(importedNames(source, './hook.js')).toEqual(['useTooltipPopup'])
  })

  it('the call scan sees a bare hook, a member hook and use, and not a word that starts with use', () => {
    expect(hookCalls('f(useA(), X.useB(), use(p), user(), x.used())')).toEqual(['useA', 'useB', 'use'])
  })

  it('imports nothing from the provider itself: the direction comes through hook.ts, with ltr when no provider is mounted', () => {
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual([])
  })

  it('takes Base UI from its tooltip entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/tooltip'])
  })

  it('imports the schema with nothing at runtime, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })
})

describe('hook.ts holds the one thing a part reads from the provider (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports the provider context and nothing else: no React, so no state of its own', () => {
    expect(importedModules(source)).toEqual(['#shared/provider/context.js'])
  })

  it('calls useDirection and no other hook', () => {
    expect(hookCalls(source)).toEqual(['useDirection'])
  })
})
