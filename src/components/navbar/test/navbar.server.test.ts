import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

/** check-boundaries applies R-5.1-1 to index.tsx only, so every file in parts/ is read here. */
const SERVER_FILES = readdirSync(join(FOLDER, 'parts')).map((file) => `parts/${file}`)

/** Every name the file imports from any module, so a hook from #shared counts as well. */
const namesImported = (source: string) => importedModules(source).flatMap((module) =>
  importedNames(source, module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

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

describe('every part renders on the server', () => {
  it('found the five part files', () => {
    expect(SERVER_FILES).toHaveLength(5)
  })

  for (const file of SERVER_FILES) {
    const source = read(file)

    it(`${file} has no 'use client', first or late`, () => {
      expect(hasUseClient(source), file).toBe(false)
      expect(hasLateUseClient(source), file).toBe(false)
    })

    it(`${file} imports no hook, named or through a React namespace`, () => {
      const hooks = [
        ...namesImported(source),
        ...memberHookCalls(source, namespaceNamesOf(source, 'react')),
      ].filter(isHook)
      expect(hooks, file).toEqual([])
    })

    it(`${file} imports nothing from Base UI, and no other component`, () => {
      expect(importedModules(source).filter((m) => m.startsWith('@base-ui/') || m.startsWith('#components/')), file).toEqual([])
    })
  }

  it('only the root reaches the client half, and only for the one part it mounts', () => {
    const reaching = SERVER_FILES.filter((file) => importedModules(read(file)).includes('../client.js'))
    expect(reaching).toEqual(['parts/navbar-root.tsx'])
    expect(importedNames(read('parts/navbar-root.tsx'), '\\.\\./client\\.js')).toEqual(['NavbarOffset'])
    expect(SERVER_FILES.filter((file) => importedModules(read(file)).includes('../hook.js'))).toEqual([])
  })
})

// R-5.12-1: client.tsx is markup plus one hook call, and the state lives in hook.ts.
describe('the client half is one small part', () => {
  it('client.tsx starts with use client and exports NavbarOffset alone', async () => {
    expect(hasUseClient(read('client.tsx'))).toBe(true)
    expect(Object.keys(await import('../client.js'))).toEqual(['NavbarOffset'])
  })

  it('client.tsx calls one hook, its own, and imports none from React', () => {
    expect(hookCalls(read('client.tsx'))).toEqual(['useNavbarOffset'])
    expect(importedModules(read('client.tsx'))).toEqual(['./hook.js'])
  })

  it('hook.ts starts with use client, exports useNavbarOffset alone and takes two hooks from React', async () => {
    expect(hasUseClient(read('hook.ts'))).toBe(true)
    expect(Object.keys(await import('../hook.js'))).toEqual(['useNavbarOffset'])
    expect(importedNames(read('hook.ts'), 'react').sort()).toEqual(['useEffect', 'useRef'])
  })

  it('neither file imports Base UI, zod or another component: the client part is a few lines', () => {
    for (const file of ['client.tsx', 'hook.ts']) {
      expect(importedModules(read(file)).filter((m) => m.startsWith('@base-ui/') || m.startsWith('zod') || m.startsWith('#components/')), file).toEqual([])
    }
  })

  it('writes the variable through the one constant, which names the token the stylesheet reads', () => {
    expect(read('hook.ts')).toContain('root.style.setProperty(NAVBAR_OFFSET_VARIABLE,')
    expect(read('hook.ts')).toContain('root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)')
    expect(read('hook.ts')).not.toContain("'--tc-")
  })
})

describe('the scans themselves', () => {
  it('see a hook imported from react and one from a shared module', () => {
    const probe = "import { useState } from 'react'\nimport { useControllableState } from '#shared/use-controllable-state.js'\n"
    expect(namesImported(probe).filter(isHook)).toEqual(['useState', 'useControllableState'])
  })

  it('see a hook reached through a namespace import, and a hook that is called', () => {
    const probe = "import * as React from 'react'\nconst [a] = React.useState(0)\n"
    expect(memberHookCalls(probe, namespaceNamesOf(probe, 'react')).filter(isHook)).toEqual(['useState'])
    expect(hookCalls('const a = useThing(); const b = other.useOther()')).toEqual(['useThing', 'useOther'])
  })
})
