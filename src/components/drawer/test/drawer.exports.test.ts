import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as drawer from '../index.js'

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
describe('index.tsx exports flat names, with no bare Drawer (R-9.2-3, R-9.2-4)', () => {
  it('exports exactly the nine parts', () => {
    expect(Object.keys(drawer).sort()).toEqual([
      'DrawerBody', 'DrawerClose', 'DrawerDescription', 'DrawerFooter', 'DrawerHeader', 'DrawerPopup', 'DrawerRoot',
      'DrawerTitle', 'DrawerTrigger',
    ])
  })

  it('exports each one as a function component, never an object a server file would dot into', () => {
    for (const [name, value] of Object.entries(drawer)) expect(typeof value, name).toBe('function')
  })

  it('names the scrolling overlay parts Header, Body and Footer, and the root Root', () => {
    for (const part of ['Root', 'Header', 'Body', 'Footer']) expect(Object.keys(drawer), part).toContain(`Drawer${part}`)
  })

  it('exports none of the parts that are not built: no swipe area, no indent, no provider, no handle', () => {
    expect(Object.keys(drawer).filter((name) => /SwipeArea|Indent|Provider|Handle|Viewport|Backdrop|Portal/.test(name))).toEqual([])
  })

  // The namespace import above holds values only, so the type exports are read from the source.
  it('has no Drawer and no Base UI type name in its type surface either', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'DrawerBody', 'DrawerBodyProps', 'DrawerClose', 'DrawerCloseProps', 'DrawerDescription', 'DrawerDescriptionProps',
      'DrawerDesignProps', 'DrawerFooter', 'DrawerFooterProps', 'DrawerHeader', 'DrawerHeaderProps', 'DrawerPlacement',
      'DrawerPopup', 'DrawerPopupProps', 'DrawerRoot', 'DrawerRootProps', 'DrawerTitle', 'DrawerTitleProps', 'DrawerTrigger',
      'DrawerTriggerProps',
    ])
  })

  it('the scan sees a type-only alias, a declared type, a constant and a star export', () => {
    const probe = "export type { A as Drawer } from './a.js'\nexport type B = string\nexport const C = 1\nexport * from './d.js'\n"
    expect(exportedNames(probe)).toEqual(['Drawer', 'B', 'C', '*'])
  })
})
