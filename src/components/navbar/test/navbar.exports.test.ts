import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { importedModules } from '../../../../scripts/lib/source-checks.js'
import * as navbar from '../index.js'

const FOLDER = join(import.meta.dirname, '..')

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

/** Every top-level statement that is not an `export ... from` line, as its syntax kind. */
function nonReexports(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)
  return file.statements
    .filter((node) => !(ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined))
    .map((node) => ts.SyntaxKind[node.kind])
}

/** Each part file and the one component it exports, named after the file (R-5.12-4). */
const PART_FILES = {
  'navbar-actions': ['NavbarActions'],
  'navbar-brand': ['NavbarBrand'],
  'navbar-link': ['NavbarLink'],
  'navbar-links': ['NavbarLinks'],
  'navbar-root': ['NavbarRoot'],
}

describe('the folder holds exactly the files Navbar needs', () => {
  it('a client.tsx and a hook.ts for the one client part, a lib.ts for its pure helper, no variants and no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'parts', 'schema.ts', 'test', 'types.ts',
    ])
  })
})

// The root-part lint reads declarations, and index.tsx declares nothing, so this is the guard.
describe('index.tsx exports flat names, and no bare Navbar', () => {
  const source = readFileSync(join(FOLDER, 'index.tsx'), 'utf8')

  it('exports exactly the five parts', () => {
    expect(Object.keys(navbar).sort()).toEqual(['NavbarActions', 'NavbarBrand', 'NavbarLink', 'NavbarLinks', 'NavbarRoot'])
  })

  it('exports each one as a function component, never an object a server file would dot into', () => {
    for (const [name, value] of Object.entries(navbar)) expect(typeof value, name).toBe('function')
  })

  it('keeps NavbarOffset private: only NavbarRoot mounts it', () => {
    expect(Object.keys(navbar)).not.toContain('NavbarOffset')
    expect(exportedNames(source)).not.toContain('NavbarOffset')
    expect(importedModules(source)).not.toContain('./client.js')
    expect(importedModules(source)).not.toContain('./hook.js')
  })

  // The namespace import above holds values only, so the type exports are read from the source.
  it('has no Navbar in its type surface either', () => {
    expect(exportedNames(source).sort()).toEqual([
      'NavbarActions', 'NavbarActionsProps', 'NavbarBrand', 'NavbarBrandProps', 'NavbarDesignProps', 'NavbarLink',
      'NavbarLinkProps', 'NavbarLinks', 'NavbarLinksProps', 'NavbarRoot', 'NavbarRootProps',
    ])
  })

  it('is nothing but export-from lines, so it holds no markup (R-5.1-2)', () => {
    expect(nonReexports(source)).toEqual([])
    expect(importedModules(source).sort()).toEqual([
      './parts/navbar-actions.js', './parts/navbar-brand.js', './parts/navbar-link.js', './parts/navbar-links.js',
      './parts/navbar-root.js', './types.js',
    ])
  })

  it('the scans see a type-only alias, a declared type, a constant, a star export and a function', () => {
    const probe = "export type { A as Navbar } from './a.js'\nexport type B = string\nexport const C = 1\nexport * from './d.js'\n"
    expect(exportedNames(probe)).toEqual(['Navbar', 'B', 'C', '*'])
    expect(nonReexports("import { x } from './y.js'\nexport function A() { return null }\nexport { c } from './c.js'\n"))
      .toEqual(['ImportDeclaration', 'FunctionDeclaration'])
  })
})

describe('parts/ holds one component per file', () => {
  it('holds exactly the five part files', () => {
    expect(readdirSync(join(FOLDER, 'parts')).sort()).toEqual([
      'navbar-actions.tsx', 'navbar-brand.tsx', 'navbar-link.tsx', 'navbar-links.tsx', 'navbar-root.tsx',
    ])
  })

  for (const [file, names] of Object.entries(PART_FILES)) {
    it(`${file}.tsx exports only the component named after it`, async () => {
      const loaded = await import(`../parts/${file}.tsx`) as Record<string, unknown>
      expect(Object.keys(loaded), file).toEqual(names)
    })
  }
})
