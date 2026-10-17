// R-5.1-2: for a C component or a connector, index.tsx re-exports and holds no markup.
import ts from 'typescript'

/** Reads a file of the folder by its path inside it (`client.tsx`, `parts/x.tsx`), or undefined when absent. */
export type ReadSibling = (path: string) => string | undefined

/** The own-folder files a C index may re-export values from without a `'use client'` of their own. */
const VALUE_SOURCES = new Set(['client.tsx', 'variants.ts', 'skeleton.tsx', 'lib.ts'])

/** `./x.js` or `./parts/x.js`: a file of this folder, never a `..` step out of it. */
const OWN_FILE = /^\.\/((?:parts\/)?[\w-]+)\.js$/

function parse(name: string, source: string): ts.SourceFile {
  const kind = name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, kind)
}

/** A folder's meta.ts sets `rendering: 'client'`, which is PLAN 18's C; a comment does not count. */
export function isClientRendering(metaSource: string): boolean {
  const visit = (node: ts.Node): boolean => {
    if (ts.isPropertyAssignment(node) && node.name.getText() === 'rendering'
      && ts.isStringLiteralLike(node.initializer) && node.initializer.text === 'client') return true
    return ts.forEachChild(node, visit) ?? false
  }
  return visit(parse('meta.ts', metaSource))
}

/** The folders R-5.1-2 covers: every folder under src/connectors/, and a component whose meta says C. */
export function isCoveredFolder(relDir: string, metaSource: string | undefined): boolean {
  if (relDir.startsWith('src/connectors/')) return true
  return metaSource !== undefined && isClientRendering(metaSource)
}

function hasJsx(node: ts.Node): boolean {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return true
  return ts.forEachChild(node, hasJsx) ?? false
}

function startsWithUseClient(name: string, source: string): boolean {
  const [first] = parse(name, source).statements
  return first !== undefined && ts.isExpressionStatement(first)
    && ts.isStringLiteral(first.expression) && first.expression.text === 'use client'
}

function isTypeOnlyExport(statement: ts.ExportDeclaration): boolean {
  if (statement.isTypeOnly) return true
  const clause = statement.exportClause
  return clause !== undefined && ts.isNamedExports(clause) && clause.elements.length > 0
    && clause.elements.every((e) => e.isTypeOnly)
}

function isTypeImport(statement: ts.Statement): boolean {
  return ts.isImportDeclaration(statement) && statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword
}

/** Why a re-export is refused, or undefined when it is allowed. */
function reexportProblem(statement: ts.ExportDeclaration, read: ReadSibling): string | undefined {
  const spec = statement.moduleSpecifier
  const stem = spec && ts.isStringLiteral(spec) ? OWN_FILE.exec(spec.text)?.[1] : undefined
  if (stem === undefined) return 'a re-export from outside the folder'
  const file = [`${stem}.ts`, `${stem}.tsx`].find((f) => read(f) !== undefined)
  if (file === undefined) return `a re-export from ./${stem}.js, which the folder does not have`
  if (isTypeOnlyExport(statement) || VALUE_SOURCES.has(file)) return undefined
  if (startsWithUseClient(file, read(file) ?? '')) return undefined
  return `a value re-export from ${file}, which is not client, variants, skeleton, lib.ts or a 'use client' file`
}

/** Each top-level statement of index.tsx that is neither an allowed re-export from its own folder nor an import type. */
export function indexMarkupViolations(source: string, read: ReadSibling): string[] {
  const file = parse('index.tsx', source)
  const out: string[] = []
  for (const statement of file.statements) {
    if (isTypeImport(statement)) continue
    const problem = ts.isExportDeclaration(statement) && statement.moduleSpecifier
      ? reexportProblem(statement, read)
      : hasJsx(statement) ? 'markup' : 'a statement that is not a re-export'
    if (problem === undefined) continue
    const { line } = file.getLineAndCharacterOfPosition(statement.getStart(file))
    out.push(`line ${line + 1}: ${problem}`)
  }
  return out
}
