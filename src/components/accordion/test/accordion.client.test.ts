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

describe('the folder is a split component', () => {
  it('holds exactly the files Accordion needs: a hook.ts and a lib.ts, and no variants or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'schema.ts', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a server page can import it and write the titles and the panels itself', () => {
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

  it('each part calls at most one hook: the root none, the item one for its id and its region', () => {
    expect(hooksByPart(source)).toEqual({ AccordionRoot: [], AccordionItem: ['useAccordionItem'] })
  })

  it('takes that hook from hook.ts, and its one pure helper from lib.ts', () => {
    expect(importedNames(source, './hook.js')).toEqual(['useAccordionItem'])
    expect(importedNames(source, './lib.js')).toEqual(['headingFor'])
  })

  it('imports nothing from the provider: an accordion is no portal, and reads no direction and no label', () => {
    expect(importedModules(source).filter((m) => m.includes('provider') || m.includes('labels'))).toEqual([])
  })

  it('takes Base UI from its accordion entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/accordion'])
  })

  it('imports no other component but Svg, and the caret by its own name (R-7-1)', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.startsWith('#icons/'))).toEqual(['#icons/data/caret-down.js'])
  })

  it('imports the schema with nothing at runtime, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('the scan sees a bare hook, a member hook and use, a second call in one part, and not a word that starts with use', () => {
    const probe = 'function A() { return f(useA(), X.useB(), use(p), user(), x.used()) }\nfunction B() { return 1 }\nconst c = useC()\n'
    expect(hooksByPart(probe)).toEqual({ A: ['useA', 'useB', 'use'], B: [] })
    expect(hookCallsIn(parse(probe))).toEqual(['useA', 'useB', 'use', 'useC'])
  })
})

describe('hook.ts holds what an item needs from React (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports useId, useRef and the type of a click from React, the shared tab stop and how long a press is held: no state of its own', () => {
    expect(importedModules(source)).toEqual(['react', '#shared/use-scroll-tab-stop.js', './constants.js'])
    expect(importedNames(source, 'react')).toEqual(['MouseEvent', 'useId', 'useRef'])
  })

  it('one hook: the id of the trigger, the ref of the region and its tab stop; the hold of a press calls none', () => {
    expect(hooksByPart(source)).toEqual({ holdTrigger: [], scrollerOf: [], useAccordionItem: ['useRef', 'useId', 'useScrollTabStop'] })
  })
})

describe('lib.ts holds the pure helper (R-8.1-1)', () => {
  const source = read('lib.ts')

  it('imports no React and no client code: clamp, the bounds, the table of tags and its types', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(importedModules(source)).toEqual(['#shared/clamp.js', './boundaries.js', './constants.js', './types.js'])
    expect(hookCallsIn(parse(source))).toEqual([])
  })
})
