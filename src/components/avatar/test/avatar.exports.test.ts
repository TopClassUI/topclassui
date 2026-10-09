import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as avatar from '../index.js'

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

/** Each part file and the one component it exports, named after the file (R-5.12-4). */
const PART_FILES = {
  'avatar-fallback': ['AvatarFallback'],
  'avatar-image': ['AvatarImage'],
  'avatar-root': ['AvatarRoot'],
}

// The root-part lint reads declarations, and index.tsx declares nothing, so this is the guard.
describe('index.tsx exports flat names, and no bare Avatar', () => {
  it('exports exactly the three parts and the skeleton', () => {
    expect(Object.keys(avatar).sort()).toEqual([
      'AvatarFallback', 'AvatarImage', 'AvatarRoot', 'AvatarSkeleton',
    ])
  })

  it('exports each one as a function component, never an object a server file would dot into', () => {
    for (const [name, value] of Object.entries(avatar)) expect(typeof value, name).toBe('function')
  })

  // The namespace import above holds values only, so the type exports are read from the source.
  it('has no Avatar in its type surface either', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'AvatarDesignProps', 'AvatarFallback', 'AvatarFallbackProps', 'AvatarImage', 'AvatarImageProps',
      'AvatarRoot', 'AvatarRootProps', 'AvatarSize', 'AvatarSkeleton', 'AvatarSkeletonProps',
    ])
  })

  it('the scan sees a type-only alias, a declared type, a constant and a star export', () => {
    const probe = "export type { A as Avatar } from './a.js'\nexport type B = string\nexport const C = 1\nexport * from './d.js'\n"
    expect(exportedNames(probe)).toEqual(['Avatar', 'B', 'C', '*'])
  })
})

describe('parts/ holds one component per file', () => {
  it('holds exactly the three part files', () => {
    expect(readdirSync(join(import.meta.dirname, '..', 'parts')).sort()).toEqual([
      'avatar-fallback.tsx', 'avatar-image.tsx', 'avatar-root.tsx',
    ])
  })

  for (const [file, names] of Object.entries(PART_FILES)) {
    it(`${file}.tsx exports only the component named after it`, async () => {
      const loaded = await import(`../parts/${file}.tsx`) as Record<string, unknown>
      expect(Object.keys(loaded), file).toEqual(names)
    })
  }
})
