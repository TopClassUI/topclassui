import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

const parse = (source: string) => ts.createSourceFile('hook.ts', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)

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

describe('hook.ts holds what the parts read from React and the provider (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports the context, the id, the ref and the transition hooks from React: the shared tab stop holds the state', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/contracts/menu.js', '#shared/provider/use-portal-locale.js', '#shared/use-scroll-tab-stop.js', './lib.js', './types.js',
    ])
    expect(importedNames(source, 'react')).toEqual(['createContext', 'useContext', 'useId', 'useImperativeHandle', 'useRef', 'useTransition'])
  })

  it('one hook per part: the scope of the root, the locale of the positioner, the ref, tab stop and scope of the menu, the transition of the data-driven menu', () => {
    expect(hooksByPart(source)).toEqual({
      useDropdownRoot: ['useId'],
      useDropdownPositioner: ['usePortalLocale'],
      useDropdownPopup: ['useRef', 'useImperativeHandle', 'useScrollTabStop', 'useContext'],
      useDropdownMenu: ['useTransition'],
    })
  })

  it('never reads the direction alone: useDirection answers ltr with no provider, which a portal must not be stamped with', () => {
    expect(source).not.toContain('useDirection')
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual(['#shared/provider/use-portal-locale.js'])
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('lib.tsx is pure, and classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  it('lib.tsx imports no hook: what it takes from React builds and reads elements', () => {
    expect(importedNames(read('lib.tsx'), 'react')).toEqual(['Children', 'isValidElement', 'ReactElement', 'ReactNode'])
    expect(hookCallsIn(parse(read('lib.tsx')))).toEqual([])
    expect(hasUseClient(read('lib.tsx'))).toBe(false)
  })

  it('lib.tsx takes the link, the trigger and the label helpers from src/shared', () => {
    const source = read('lib.tsx')
    expect(importedNames(source, '#shared/link.js')).toEqual(['renderLink'])
    expect(importedNames(source, '#shared/render-trigger.js')).toEqual(['renderTrigger'])
    expect(importedNames(source, '#shared/truncate-label.js')).toEqual(['truncateLabel'])
  })

  it('classes.ts takes the row, its highlight, its touch floor, the cap, the surface, the motion, the scroll area and the inset ring from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual([
      'CONTAIN', 'FOCUS_RING_INSET', 'LIST_CAP', 'OVERLAY_SURFACE', 'POPUP_MOTION', 'ROW', 'ROW_HIGHLIGHT', 'ROW_TOUCH', 'SCROLL_AREA',
    ])
  })

  it('classes.ts writes no scrim and no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/SCRIM|\b(left|right)-/)
  })
})
