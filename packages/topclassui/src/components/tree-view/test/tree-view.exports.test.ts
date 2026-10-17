import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as treeView from '../index.js'

/** Each name a file's export statements give, type-only ones included; `export *` reads as '*'. */
function exportedNames(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest)
  return file.statements.flatMap((node): string[] => {
    if (!ts.isExportDeclaration(node)) return []
    const clause = node.exportClause
    if (!clause) return ['*']
    return ts.isNamedExports(clause) ? clause.elements.map((e) => e.name.text) : [clause.name.text]
  })
}

describe('index.tsx exports one flat name (R-9.2-3), no Root since TreeView is not a family', () => {
  it('exports exactly TreeView, a function component', () => {
    expect(Object.keys(treeView)).toEqual(['TreeView'])
    expect(typeof treeView.TreeView).toBe('function')
  })

  it('has no hook, no lib helper and no row type in its surface', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual(['TreeNode', 'TreeView', 'TreeViewDesignProps', 'TreeViewName', 'TreeViewProps', 'TreeViewStatus'])
  })

  it('the scan sees a type-only alias and a star export', () => {
    expect(exportedNames("export type { A as B } from './a.js'\nexport * from './d.js'\n")).toEqual(['B', '*'])
  })
})
