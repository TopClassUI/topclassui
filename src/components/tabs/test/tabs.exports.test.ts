import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as tabs from '../index.js'

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
describe('index.tsx exports flat names, with no bare Tabs (R-9.2-3, R-9.2-4)', () => {
  it('exports exactly the four parts and the skeleton', () => {
    expect(Object.keys(tabs).sort()).toEqual(['TabsList', 'TabsPanel', 'TabsRoot', 'TabsSkeleton', 'TabsTab'])
  })

  it('exports each one as a function component, never an object a server file would dot into', () => {
    for (const [name, value] of Object.entries(tabs)) expect(typeof value, name).toBe('function')
  })

  // The namespace import above holds values only, so the type exports are read from the source.
  it('has no Tabs and no context in its type surface either', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'TabsDesignProps', 'TabsList', 'TabsListName', 'TabsListProps', 'TabsPanel', 'TabsPanelProps', 'TabsRoot',
      'TabsRootProps', 'TabsSkeleton', 'TabsSkeletonProps', 'TabsTab', 'TabsTabProps', 'TabsVariant',
    ])
  })

  it('the scan sees a type-only alias, a declared type, a constant and a star export', () => {
    const probe = "export type { A as Tabs } from './a.js'\nexport type B = string\nexport const C = 1\nexport * from './d.js'\n"
    expect(exportedNames(probe)).toEqual(['Tabs', 'B', 'C', '*'])
  })
})
