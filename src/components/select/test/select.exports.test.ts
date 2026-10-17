import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as select from '../index.js'

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

describe('index.tsx exports flat names (R-9.2-3), the parts being choice 7', () => {
  it('exports exactly Select and SelectSkeleton, two function components', () => {
    expect(Object.keys(select).sort()).toEqual(['Select', 'SelectSkeleton'])
    expect([typeof select.Select, typeof select.SelectSkeleton]).toEqual(['function', 'function'])
  })

  it('has no Base UI type name, no context and no hook in its surface', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual(['Select', 'SelectDesignProps', 'SelectName', 'SelectPlacement', 'SelectProps', 'SelectSkeleton', 'SelectSkeletonProps'])
  })

  it('the scan sees a type-only alias and a star export', () => {
    expect(exportedNames("export type { A as B } from './a.js'\nexport * from './d.js'\n")).toEqual(['B', '*'])
  })
})
