import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as fields from '../index.js'

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

describe('index.tsx exports flat names (R-9.2-3)', () => {
  it('exports exactly NumberField and NumberFieldSkeleton, two function components', () => {
    expect(Object.keys(fields).sort()).toEqual(['NumberField', 'NumberFieldSkeleton'])
    expect([typeof fields.NumberField, typeof fields.NumberFieldSkeleton]).toEqual(['function', 'function'])
  })

  it('has no Base UI type name and no part in its type surface either', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'NumberField', 'NumberFieldDesignProps', 'NumberFieldName', 'NumberFieldProps', 'NumberFieldSkeleton', 'NumberFieldSkeletonProps',
    ])
  })

  it('the scan sees a type-only alias and a star export', () => {
    expect(exportedNames("export type { A as B } from './a.js'\nexport * from './d.js'\n")).toEqual(['B', '*'])
  })
})
