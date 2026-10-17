import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as textarea from '../index.js'

/** Each name a file's export statements give, type-only ones included; `export *` reads as '*'. */
function exportedNames(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest)
  return file.statements.flatMap((node): string[] => {
    if (ts.isFunctionDeclaration(node) && node.name && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return [node.name.text]
    if (!ts.isExportDeclaration(node)) return []
    const clause = node.exportClause
    if (!clause) return ['*']
    return ts.isNamedExports(clause) ? clause.elements.map((e) => e.name.text) : [clause.name.text]
  })
}

describe('index.tsx exports two flat names (R-9.2-3)', () => {
  it('exports exactly Textarea and TextareaSkeleton, two function components; the holder stays inside', () => {
    expect(Object.keys(textarea).sort()).toEqual(['Textarea', 'TextareaSkeleton'])
    expect([typeof textarea.Textarea, typeof textarea.TextareaSkeleton]).toEqual(['function', 'function'])
  })

  it('names the types beside them, and no part', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'Textarea', 'TextareaDesignProps', 'TextareaName', 'TextareaProps', 'TextareaSkeleton', 'TextareaSkeletonProps',
    ])
  })

  it('the scan sees a function, a type-only alias and a star export', () => {
    expect(exportedNames("export function A() {}\nexport type { B as C } from './b.js'\nexport * from './d.js'\n")).toEqual(['A', 'C', '*'])
  })
})
