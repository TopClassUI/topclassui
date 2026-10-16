import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

const isHook = (name: string) => name === 'use' || /^use[A-Z]/.test(name)

/** The hooks each top-level function of a file calls, by the function's name. */
function hooksPerFunction(source: string): Record<string, string[]> {
  const file = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const out: Record<string, string[]> = {}
  for (const node of file.statements) {
    if (!ts.isFunctionDeclaration(node) || !node.name) continue
    const calls: string[] = []
    const visit = (inner: ts.Node): void => {
      if (ts.isCallExpression(inner) && ts.isIdentifier(inner.expression) && isHook(inner.expression.text)) calls.push(inner.expression.text)
      ts.forEachChild(inner, visit)
    }
    visit(node)
    out[node.name.text] = calls
  }
  return out
}

describe('the folder is split: one client part beside the server ones', () => {
  it('holds client.tsx, hook.ts and lib.ts beside the files the server half had', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'parts', 'schema.ts', 'skeleton.tsx', 'test', 'types.ts',
    ])
  })

  it('index.tsx has no use client and takes the image, and only the image, from client.tsx', () => {
    const source = read('index.tsx')
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
    expect(source.match(/^export \{[^}]*\} from '\.\/client\.js'$/gm)).toEqual(["export { AvatarImage } from './client.js'"])
  })
})

describe('client.tsx is the browser half (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [...importedNames(source, 'react'), ...memberHookCalls(source, namespaceNamesOf(source, 'react'))].filter(isHook)
    expect(hooks).toEqual([])
  })

  it('AvatarImage calls one hook, its own, from hook.ts', () => {
    expect(hooksPerFunction(source)).toEqual({ AvatarImage: ['useAvatarImage'] })
    expect(importedNames(source, './hook.js')).toEqual(['useAvatarImage'])
  })

  it('imports nothing from Base UI: its avatar Root would take the root and the fallback to the client', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual([])
  })
})

describe('hook.ts and lib.ts', () => {
  it("hook.ts starts with 'use client' and reads React alone", () => {
    const source = read('hook.ts')
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(importedModules(source).sort()).toEqual(['./types.js', 'react'])
    expect(hooksPerFunction(source)).toEqual({
      useAvatarImage: ['useRef', 'useRef', 'useState', 'useCallback', 'useCallback', 'useEffect', 'useCallback', 'useCallback'],
    })
  })

  // check-boundaries reads `<Letter` in hook.ts as JSX, so a type argument is never written there.
  it('hook.ts writes no type argument in angle brackets', () => {
    expect(read('hook.ts').match(/<[A-Za-z]/g)).toBeNull()
  })

  it('lib.ts imports nothing at all', () => {
    expect(importedModules(read('lib.ts'))).toEqual([])
  })
})
