// R-5.1-2: for a C component or a connector, index.tsx re-exports and holds no markup.
import ts from 'typescript'

/** C entries the rule does not cover, each with its docs/DECISIONS.md reason. */
export const INDEX_MARKUP_EXEMPT = new Set(['icon-registry'])

/** A folder's meta.ts says `rendering: 'client'`, which is PLAN 18's C. */
export function isClientRendering(metaSource: string): boolean {
  return /\brendering\s*:\s*(['"])client\1/.test(metaSource)
}

function hasJsx(node: ts.Node): boolean {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return true
  return ts.forEachChild(node, hasJsx) ?? false
}

function isSiblingReexport(statement: ts.Statement): boolean {
  if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) return false
  return ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text.startsWith('./')
}

function isTypeImport(statement: ts.Statement): boolean {
  return ts.isImportDeclaration(statement) && statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword
}

/** Each top-level statement of index.tsx that is not a re-export from its own folder. */
export function indexMarkupViolations(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const out: string[] = []
  for (const statement of file.statements) {
    if (isSiblingReexport(statement) || isTypeImport(statement)) continue
    const { line } = file.getLineAndCharacterOfPosition(statement.getStart(file))
    const what = hasJsx(statement) ? 'markup' : 'a statement that is not a re-export'
    out.push(`line ${line + 1}: ${what}`)
  }
  return out
}
