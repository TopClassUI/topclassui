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

describe('the folder holds what Popover needs and nothing else (R-8.1-1)', () => {
  it('a hook.ts, a lib.ts and a boundaries.ts, and no variants or skeleton', () => {
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

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [
      ...importedNames(source, 'react'),
      ...memberHookCalls(source, namespaceNamesOf(source, 'react')),
    ].filter(isHook)
    expect(hooks).toEqual([])
  })

  // Read part by part: seven functions share the file, and each one is markup plus at most one hook of its own.
  it('each part calls at most one hook: the root for its scope, the positioner for its locale, the popup for its tab stop, the close for its label', () => {
    expect(hooksByPart(source)).toEqual({
      PopoverRoot: ['usePopoverRoot'],
      PopoverTrigger: [],
      PopoverPopup: ['usePopoverPositioner'],
      PopoverSurface: ['usePopoverPopup'],
      PopoverTitle: [],
      PopoverDescription: [],
      PopoverClose: ['usePopoverClose'],
    })
  })

  it('takes its four hooks and the scope context from hook.ts, and calls no hook from anywhere else', () => {
    expect(importedNames(source, './hook.js')).toEqual([
      'PopoverScopeContext', 'usePopoverClose', 'usePopoverPopup', 'usePopoverPositioner', 'usePopoverRoot',
    ])
    expect(hookCallsIn(parse(source)).sort()).toEqual(['usePopoverClose', 'usePopoverPopup', 'usePopoverPositioner', 'usePopoverRoot'])
  })

  it('imports neither shared hook itself: the tab stop and the locale reach the parts through hook.ts', () => {
    expect(importedModules(source).filter((m) => m.includes('use-scroll-tab-stop') || m.includes('use-portal-locale'))).toEqual([])
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual([])
  })

  it('takes its pure helpers from src/shared and imports them, never a copy', () => {
    expect(importedNames(source, '#shared/overlay.js')).toEqual(['guardEscape'])
    expect(importedNames(source, '#shared/render-trigger.js')).toEqual(['hasContent', 'renderPart', 'renderTrigger'])
    expect(importedNames(source, '#shared/floating.js')).toEqual(['POPUP_BOUNDS', 'toSideAlign'])
    expect(importedNames(source, '#shared/clamp.js')).toEqual(['clamp'])
    expect(importedModules(source).filter((m) => m.startsWith('./')).sort()).toEqual([
      './boundaries.js', './classes.js', './constants.js', './hook.js', './types.js',
    ])
  })

  it('takes Base UI from its popover entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/popover'])
  })

  it('imports no other Unit 3 component, Dialog and Tooltip least of all: only Svg, which draws the x. And no schema, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('never names a physical side: the positioner takes what toSideAlign returns', () => {
    expect(source).not.toMatch(/side=["'{]+(left|right)/)
    expect(source).toContain('side={side}')
  })

  it('the scan sees a bare hook, a member hook and use, a second call in one part, and not a word that starts with use', () => {
    const probe = 'function A() { return f(useA(), X.useB(), use(p), user(), x.used()) }\nfunction B() { return 1 }\nconst c = useC()\n'
    expect(hooksByPart(probe)).toEqual({ A: ['useA', 'useB', 'use'], B: [] })
    expect(hookCallsIn(parse(probe))).toEqual(['useA', 'useB', 'use', 'useC'])
  })
})

describe('hook.ts holds what the parts read from React and the provider (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports the context, the id and the ref hooks from React and no hook that holds state: the shared tab stop does', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/provider/context.js', '#shared/provider/use-portal-locale.js', '#shared/use-scroll-tab-stop.js',
      './lib.js', './types.js',
    ])
    expect(importedNames(source, 'react')).toEqual(['createContext', 'useContext', 'useId', 'useImperativeHandle', 'useRef'])
  })

  it('one hook per part: the scope of the root, the locale of the positioner, the ref and the tab stop of the popup, the label of the x', () => {
    expect(hooksByPart(source)).toEqual({
      usePopoverRoot: ['useId'],
      usePopoverPositioner: ['usePortalLocale'],
      usePopoverPopup: ['useRef', 'useImperativeHandle', 'useScrollTabStop', 'useContext'],
      usePopoverClose: ['useLabels'],
    })
  })

  it('never reads the direction alone: useDirection answers ltr with no provider, which a portal must not be stamped with', () => {
    expect(importedNames(source, '#shared/provider/context.js')).toEqual(['useLabels'])
  })

  // check-boundaries reads a `<Letter` in hook.ts as JSX.
  it('writes no type argument in angle brackets', () => {
    expect(source).not.toMatch(/<[A-Za-z]/)
  })
})

describe('lib.ts is pure, and classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  it('lib.ts imports nothing at all, React least of all', () => {
    expect(importedModules(read('lib.ts'))).toEqual([])
  })

  it('classes.ts takes the surface, the motion, the scroll area, the inset ring and the icon button from src/shared', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual([
      'FOCUS_RING_INSET', 'HOVER', 'ICON_BUTTON', 'OVERLAY_SURFACE', 'POPUP_MOTION', 'SCROLL_AREA',
    ])
  })

  it('classes.ts writes no scrim and no physical side', () => {
    expect(read('classes.ts')).not.toMatch(/SCRIM|\b(left|right)-/)
  })
})
