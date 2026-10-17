import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'
import { SLIDE_MOTION } from '#shared/classes.js'
import { DRAWER_POPUP } from '../classes.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

const parse = (source: string) => ts.createSourceFile('client.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)

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

describe('hook.ts holds what the parts read from the provider (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports the context, the ref and the memo hooks from React and no hook that holds state: the shared tab stop does', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/overlay-scope.js', '#shared/provider/context.js', '#shared/provider/use-portal-locale.js',
      '#shared/use-scroll-tab-stop.js', './constants.js', './lib.js', './types.js',
    ])
    expect(importedNames(source, 'react')).toEqual(['createContext', 'useContext', 'useImperativeHandle', 'useMemo', 'useRef'])
    expect(importedNames(source, '#shared/overlay-scope.js')).toEqual(['useOverlayRoot', 'useOverlayScope'])
  })

  it('one hook per part: the direction, the settings and the scope of the root, the locale and the scope of the portal, the ref and the tab stop of the body, the label of the x', () => {
    expect(hooksByPart(source)).toEqual({
      useDrawerRoot: ['useDirection', 'useMemo', 'useOverlayRoot'],
      useDrawerPopup: ['usePortalLocale', 'useContext', 'useOverlayScope'],
      useDrawerBody: ['useRef', 'useImperativeHandle', 'useScrollTabStop'],
      useDrawerClose: ['useLabels'],
    })
  })

  it('reads the direction for the swipe only: what the viewport is stamped with comes from usePortalLocale, which answers nothing with no provider', () => {
    expect(importedNames(source, '#shared/provider/context.js')).toEqual(['useDirection', 'useLabels'])
    expect(importedNames(source, './lib.js')).toEqual(['toSwipeDirection'])
  })

  it('writes no type argument in angle brackets, which check-boundaries would read as markup', () => {
    expect(source.match(/<[A-Z]/g) ?? []).toEqual([])
  })
})

describe('lib.ts is pure (R-5.12-1)', () => {
  const source = read('lib.ts')

  it('imports no React and nothing at runtime: two types, and the rest is arithmetic on strings', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(importedModules(source)).toEqual(['#shared/provider/context.js', './types.js'])
    expect(source.match(/^import (?!type )/gm) ?? []).toEqual([])
    expect(hookCallsIn(parse(source))).toEqual([])
  })
})

describe('classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  const source = read('classes.ts')

  it('takes the scrim, the fade, the slide, the rings, the x, the scroll area and the action wrap from src/shared', () => {
    expect(importedNames(source, '#shared/classes.js')).toEqual([
      'ACTIONS_WRAP', 'FADE_MOTION', 'FOCUS_RING_INSET', 'FORCED_EDGE', 'HOVER', 'ICON_BUTTON', 'SCRIM', 'SCROLL_AREA',
      'SLIDE_MOTION',
    ])
    expect(source).not.toContain('whitespace-normal')
    expect(source).not.toContain('pointer-events-')
  })

  // Measured in e2e/drawer.spec.ts: on the translate property the sheet ran twice as far as the finger.
  it('wears SLIDE_MOTION, and moves the sheet by transform, the property Base UI moves it by', () => {
    const worn = DRAWER_POPUP.split(' ')
    expect(worn).not.toContain('data-swiping:transition-none')
    expect(worn.filter((cls) => cls.includes('translate-x-') || cls.includes('translate-y-') || cls.startsWith('transition-['))).toEqual([])
    expect(worn.filter((cls) => cls.startsWith('transition-') || cls.startsWith('duration-') || cls.startsWith('ease-')))
      .toEqual(['transition-transform', 'duration-(--tc-duration-slow)', 'ease-out'])
    expect(DRAWER_POPUP).toContain(SLIDE_MOTION)
  })
})
