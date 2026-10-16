import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')
const PARTS = ['parts/sidebar-body.tsx', 'parts/sidebar-group.tsx', 'parts/sidebar-header.tsx', 'parts/sidebar-link.tsx']

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

describe('the folder is a split component: a client shell and its toggle around server parts', () => {
  it('holds exactly the files Sidebar needs: no variants and no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'parts', 'schema.ts', 'test', 'types.ts',
    ])
    expect(readdirSync(join(FOLDER, 'parts')).sort().map((file) => `parts/${file}`)).toEqual(PARTS)
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client, so a Server Component page can import the parts and write their links', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('is nothing but export-from lines, so it cannot render or call anything', () => {
    expect(nonReexports(source)).toEqual([])
  })

  it('takes the two client parts from client.tsx, each server part from its own file, and the types from types.ts', () => {
    expect(importedModules(source).sort()).toEqual([
      './client.js', './parts/sidebar-body.js', './parts/sidebar-group.js', './parts/sidebar-header.js', './parts/sidebar-link.js', './types.js',
    ])
    expect(source.split('\n')).toContain("export { SidebarRoot, SidebarTrigger } from './client.js'")
  })
})

describe('client.tsx is the browser half (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports no React hook, named or through a namespace', () => {
    const hooks = [...importedNames(source, 'react'), ...memberHookCalls(source, namespaceNamesOf(source, 'react'))].filter(isHook)
    expect(hooks).toEqual([])
  })

  it('each part calls one hook, its own, from hook.ts', () => {
    expect(hooksPerFunction(source)).toEqual({ SidebarRoot: ['useSidebarRoot'], SidebarTrigger: ['useSidebarTrigger'] })
    expect(importedNames(source, './hook.js').sort()).toEqual(['SidebarContext', 'useSidebarRoot', 'useSidebarTrigger'])
  })

  it('imports no Base UI part, no schema and no zod: nothing here needs them', () => {
    expect(importedModules(source).filter((m) => m.startsWith('@base-ui/') || m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('imports one component, Svg, and the one icon of the toggle by its own file (R-7-1)', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/'))).toEqual(['#components/svg/index.js'])
    expect(importedModules(source).filter((m) => m.startsWith('#icons/'))).toEqual(['#icons/data/sidebar-simple.js'])
  })
})

describe('hook.ts holds the state, the context that shares it and the labels (R-5.12-1)', () => {
  const source = read('hook.ts')

  it("starts with 'use client', as every module that calls a hook does", () => {
    expect(hasUseClient(source)).toBe(true)
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports React, the labels of the provider, the shared state hook and its types', () => {
    expect(importedModules(source).sort()).toEqual(['#shared/provider/context.js', '#shared/use-controllable-state.js', './types.js', 'react'])
    expect(importedNames(source, 'react').sort()).toEqual(['createContext', 'useContext', 'useMemo'])
  })

  it('the root holds the state through useControllableState and memoizes what it shares; the trigger reads it', () => {
    expect(hooksPerFunction(source)).toEqual({
      useSidebarRoot: ['useControllableState', 'useLabels', 'useMemo'],
      useSidebarTrigger: ['useContext', 'useLabels'],
    })
  })

  // An effect would run after the first paint: a rail collapsed from the start would flash open.
  it('uses no effect and no state of its own: the state the server renders is the state the page hydrates with', () => {
    expect(hookCalls(source).filter((name) => name.endsWith('Effect') || name === 'useState')).toEqual([])
  })

  // check-boundaries reads `<Letter` in hook.ts as JSX, so a type argument is never written there.
  it('writes no type argument in angle brackets', () => {
    expect(source.match(/<[A-Za-z]/g)).toBeNull()
  })
})

describe('every file in parts/ is server markup (R-5.1-1, R-5.1-4)', () => {
  /** Every name the file imports from any module, so a hook from #shared counts as well. */
  const namesImported = (source: string) => importedModules(source).flatMap((module) =>
    importedNames(source, module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  for (const file of PARTS) {
    const source = read(file)

    it(`${file} has no 'use client', first or late`, () => {
      expect(hasUseClient(source), file).toBe(false)
      expect(hasLateUseClient(source), file).toBe(false)
    })

    it(`${file} reads no context and imports neither hook.ts nor the provider: it learns the state from CSS`, () => {
      expect(importedModules(source).filter((m) => m.includes('hook') || m.includes('provider') || m.startsWith('@base-ui/')), file).toEqual([])
      expect(source).not.toMatch(/\bcreateContext\s*\(|\buseContext\s*\(/)
    })
  }

  it('the only hook any of them calls is useId, which a Server Component may: it names the list of a group', () => {
    expect(Object.fromEntries(PARTS.map((file) => [file, namesImported(read(file)).filter(isHook)]))).toEqual({
      'parts/sidebar-body.tsx': [], 'parts/sidebar-group.tsx': ['useId'], 'parts/sidebar-header.tsx': [], 'parts/sidebar-link.tsx': [],
    })
    expect(hookCalls(read('parts/sidebar-group.tsx'))).toEqual(['useId'])
  })

  it('only the header imports the client file, for the one client part it renders: the toggle', () => {
    expect(PARTS.filter((file) => importedModules(read(file)).includes('../client.js'))).toEqual(['parts/sidebar-header.tsx'])
    expect(importedNames(read('parts/sidebar-header.tsx'), '../client.js')).toEqual(['SidebarTrigger'])
  })

  it('lib.ts imports the shared label cut and nothing else, React least of all', () => {
    expect(importedModules(read('lib.ts'))).toEqual(['#shared/truncate-label.js'])
  })
})

describe('the scans see what they claim to', () => {
  it('a function, a constant and an import are not re-exports', () => {
    const probe = "import { x } from './y.js'\nexport function A() { return null }\nconst b = 1\nexport { c } from './c.js'\n"
    expect(nonReexports(probe)).toEqual(['ImportDeclaration', 'FunctionDeclaration', 'FirstStatement'])
  })

  it('a bare hook, a member hook and use are calls to a hook, and a word that starts with use is not', () => {
    expect(hookCalls('f(useA(), X.useB(), use(p), user(), x.used())')).toEqual(['useA', 'useB', 'use'])
  })
})
