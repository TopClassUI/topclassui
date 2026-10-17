import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as radios from '../index.js'

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

describe('index.tsx exports flat names, the root named Root (R-9.2-3, R-9.2-4)', () => {
  it('exports exactly RadioGroupItem, RadioGroupRoot and RadioGroupSkeleton, three function components', () => {
    expect(Object.keys(radios).sort()).toEqual(['RadioGroupItem', 'RadioGroupRoot', 'RadioGroupSkeleton'])
    expect(typeof radios.RadioGroupRoot).toBe('function')
    expect(typeof radios.RadioGroupItem).toBe('function')
    expect(typeof radios.RadioGroupSkeleton).toBe('function')
  })

  it('has no Base UI type name, no context and no hook in its surface', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'RadioGroupDesignProps', 'RadioGroupItem', 'RadioGroupItemProps', 'RadioGroupName', 'RadioGroupOrientation', 'RadioGroupRoot',
      'RadioGroupRootProps', 'RadioGroupSkeleton', 'RadioGroupSkeletonProps',
    ])
  })

  it('the scan sees a type-only alias and a star export', () => {
    expect(exportedNames("export type { A as B } from './a.js'\nexport * from './d.js'\n")).toEqual(['B', '*'])
  })
})
