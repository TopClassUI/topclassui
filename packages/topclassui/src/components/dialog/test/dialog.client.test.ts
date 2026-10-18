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

// The first modal folder of Unit 3: Drawer, Command and the popups copy this half of the contract.
describe('the folder is the client template', () => {
  it('holds exactly the files Dialog needs: a hook.ts, and no lib, boundaries, variants or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'meta.ts', 'schema.ts',
      'test', 'types.ts',
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

  // Read part by part: nine parts share the file, and each one is markup plus at most one hook of its own.
  it('each part calls at most one hook: the root for its scope, the popup for its locale, the body for its tab stop, the close for its label', () => {
    expect(hooksByPart(source)).toEqual({
      DialogRoot: ['useDialogRoot'],
      DialogTrigger: [],
      DialogPopup: ['useDialogPopup'],
      DialogHeader: [],
      DialogTitle: [],
      DialogDescription: [],
      DialogBody: ['useDialogBody'],
      DialogFooter: [],
      DialogClose: ['useDialogClose'],
    })
  })

  it('takes only its four hooks from hook.ts, and calls no hook from anywhere else', () => {
    expect(importedNames(source, './hook.js')).toEqual([
      'useDialogBody', 'useDialogClose', 'useDialogPopup', 'useDialogRoot',
    ])
    expect(hookCallsIn(parse(source)).sort()).toEqual(['useDialogBody', 'useDialogClose', 'useDialogPopup', 'useDialogRoot'])
  })

  it('imports neither shared hook itself: the tab stop and the locale reach the parts through hook.ts', () => {
    expect(importedModules(source).filter((m) => m.includes('use-scroll-tab-stop') || m.includes('use-portal-locale'))).toEqual([])
  })

  it('takes its helpers from src/shared, where the next overlay finds them, so no logic is written between the tags', () => {
    // The Escape guard comes through hook.ts with the root's own scope, which this context hands to the popup.
    expect(importedNames(source, '#shared/overlay.js')).toEqual([])
    expect(importedNames(source, '#shared/overlay-scope.js')).toEqual(['OverlayScopeContext'])
    expect(importedNames(source, '#shared/render-trigger.js')).toEqual(['hasContent', 'renderPart', 'renderTrigger'])
    expect(importedModules(source).filter((m) => m.startsWith('./')).sort()).toEqual([
      './classes.js', './constants.js', './hook.js', './types.js',
    ])
  })

  it('the scan sees a bare hook, a member hook and use, a second call in one part, and not a word that starts with use', () => {
    const probe = 'function A() { return f(useA(), X.useB(), use(p), user(), x.used()) }\nfunction B() { return 1 }\nconst c = useC()\n'
    expect(hooksByPart(probe)).toEqual({ A: ['useA', 'useB', 'use'], B: [] })
    expect(hookCallsIn(parse(probe))).toEqual(['useA', 'useB', 'use', 'useC'])
  })

  it('imports nothing from the provider itself: the direction and the labels come through hook.ts', () => {
    expect(importedModules(source).filter((m) => m.includes('provider'))).toEqual([])
  })

  it('takes Base UI from its dialog entry and no other Base UI part', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/'))).toEqual(['@base-ui/react/dialog'])
  })

  it('imports no other Unit 3 component: only Svg, which draws the x', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
  })

  it('imports the schema with nothing at runtime, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })
})

describe('hook.ts holds what the parts read from the provider (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports the context and the ref hooks from React and no hook that holds state: the shared tab stop does', () => {
    expect(importedModules(source)).toEqual([
      'react', '#shared/overlay-scope.js', '#shared/provider/context.js', '#shared/provider/use-portal-locale.js',
      '#shared/use-scroll-tab-stop.js', './constants.js', './types.js',
    ])
    expect(importedNames(source, 'react')).toEqual(['createContext', 'useContext', 'useImperativeHandle', 'useRef'])
  })

  it('one hook per part: the locale of the portal and how modal the root is, the ref and the tab stop of the body, the label of the x', () => {
    expect(hooksByPart(source)).toEqual({
      useDialogRoot: ['useOverlayRoot'],
      useDialogPopup: ['usePortalLocale', 'useContext', 'useOverlayScope'],
      useDialogBody: ['useRef', 'useImperativeHandle', 'useScrollTabStop'],
      useDialogClose: ['useLabels'],
    })
  })

  it('no longer reads the direction alone: useDirection answers ltr with no provider, which a portal must not be stamped with', () => {
    expect(importedNames(source, '#shared/provider/context.js')).toEqual(['useLabels'])
  })
})

describe('classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  const source = read('classes.ts')

  it('takes the action wrap of its footer from src/shared, and keeps no copy of it or of the two passive classes', () => {
    expect(importedNames(source, '#shared/classes.js')).toEqual([
      'ACTIONS_WRAP', 'FADE_MOTION', 'FOCUS_RING_INSET', 'HOVER', 'ICON_BUTTON', 'OVERLAY_SURFACE', 'POPUP_MOTION', 'SCRIM',
      'SCROLL_AREA',
    ])
    expect(source).not.toContain('whitespace-normal')
    expect(source).not.toContain('pointer-events-')
  })
})
