import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as sidebar from '../index.js'

/** Each name a file's export statements give, type-only ones included; `export *` reads as '*'. */
function exportedNames(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest)
  return file.statements.flatMap((node): string[] => {
    if (ts.isExportDeclaration(node)) {
      const clause = node.exportClause
      if (!clause) return ['*']
      return ts.isNamedExports(clause) ? clause.elements.map((e) => e.name.text) : [clause.name.text]
    }
    if (ts.isExportAssignment(node)) return ['default']
    if (!ts.canHaveModifiers(node) || !ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return []
    if (ts.isVariableStatement(node)) return node.declarationList.declarations.map((d) => d.name.getText(file))
    return [ts.getNameOfDeclaration(node as ts.DeclarationStatement)?.getText(file) ?? '?']
  })
}

// The root-part lint reads declarations, and index.tsx declares nothing, so this is the guard.
describe('index.tsx exports flat names, with no bare Sidebar (R-9.2-3, R-9.2-4)', () => {
  it('exports exactly the six parts: the rail, its toggle and the four server parts; and the skeleton', () => {
    expect(Object.keys(sidebar).sort()).toEqual([
      'SidebarBody', 'SidebarGroup', 'SidebarHeader', 'SidebarLink', 'SidebarRoot', 'SidebarSkeleton', 'SidebarTrigger',
    ])
  })

  it('exports each one as a function component, never an object a server file would dot into', () => {
    for (const [name, value] of Object.entries(sidebar)) expect(typeof value, name).toBe('function')
  })

  // The namespace import above holds values only, so the type exports are read from the source.
  it('has no Sidebar, no context and no state in its type surface either', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'SidebarBody', 'SidebarBodyProps', 'SidebarDesignProps', 'SidebarGroup', 'SidebarGroupProps', 'SidebarHeader',
      'SidebarHeaderProps', 'SidebarLink', 'SidebarLinkProps', 'SidebarRoot', 'SidebarRootProps', 'SidebarSkeleton',
      'SidebarSkeletonProps', 'SidebarTrigger', 'SidebarTriggerProps',
    ])
  })

  it('the scan sees a type-only alias, a declared type, a constant and a star export', () => {
    const probe = "export type { A as Sidebar } from './a.js'\nexport type B = string\nexport const C = 1\nexport * from './d.js'\n"
    expect(exportedNames(probe)).toEqual(['Sidebar', 'B', 'C', '*'])
  })
})
