// R-9.2-4 and R-5.12-4: the parts-folder naming contract. What each fixed file may export, read
// from the syntax tree, so a re-export, an arrow function or a default export is seen for what it is.
import ts from 'typescript'

export type ExportKind = 'function' | 'context' | 'value' | 'type' | 're-export' | 'default'

export interface ExportedName { name: string; kind: ExportKind }

/** The overlays that scroll a body between a sticky header and footer (R-10.5-1). */
export const SCROLLING_OVERLAYS = ['dialog', 'drawer'] as const

const hasExport = (node: ts.Node) =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)

const hasDefault = (node: ts.Node) =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)

function isCreateContext(init: ts.Expression): boolean {
  if (!ts.isCallExpression(init)) return false
  const callee = init.expression
  if (ts.isIdentifier(callee)) return callee.text === 'createContext'
  return ts.isPropertyAccessExpression(callee) && callee.name.text === 'createContext'
}

function kindOfInitializer(init: ts.Expression | undefined): ExportKind {
  if (!init) return 'value'
  let inner = init
  while (ts.isParenthesizedExpression(inner) || ts.isAsExpression(inner) || ts.isSatisfiesExpression(inner)) {
    inner = inner.expression
  }
  if (ts.isArrowFunction(inner) || ts.isFunctionExpression(inner)) return 'function'
  return isCreateContext(inner) ? 'context' : 'value'
}

/** Every name a module exports, with what it is. */
export function exportsOf(source: string, fileName = 'file.tsx'): ExportedName[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)
  const out: ExportedName[] = []
  for (const node of file.statements) {
    if (ts.isExportAssignment(node)) { out.push({ name: 'default', kind: 'default' }); continue }
    if (ts.isExportDeclaration(node)) {
      const clause = node.exportClause
      if (!clause) out.push({ name: '*', kind: 're-export' })
      else if (ts.isNamespaceExport(clause)) out.push({ name: clause.name.text, kind: 're-export' })
      else {
        const typeOnly = node.isTypeOnly
        for (const el of clause.elements) {
          out.push({ name: el.name.text, kind: typeOnly || el.isTypeOnly ? 'type' : 're-export' })
        }
      }
      continue
    }
    if (!hasExport(node)) continue
    if (hasDefault(node)) { out.push({ name: 'default', kind: 'default' }); continue }
    if (ts.isFunctionDeclaration(node) && node.name) out.push({ name: node.name.text, kind: 'function' })
    else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const name = ts.isIdentifier(decl.name) ? decl.name.text : decl.name.getText(file)
        out.push({ name, kind: kindOfInitializer(decl.initializer) })
      }
    } else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      out.push({ name: node.name.text, kind: 'type' })
    } else if ((ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) && node.name) {
      out.push({ name: node.name.text, kind: 'value' })
    } else if (ts.isModuleDeclaration(node)) out.push({ name: node.name.getText(file), kind: 'value' })
  }
  return out
}

/** `dialog-header.tsx` names `DialogHeader`. */
export function pascalOf(kebab: string): string {
  return kebab.replace(/\.tsx?$/, '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

/** A file in parts/ exports exactly one component, named after the file (R-5.12-4). */
export function partFileProblems(fileName: string, source: string): string[] {
  const expected = pascalOf(fileName)
  const names = exportsOf(source, fileName)
  if (names.length === 0) return [`exports nothing; a part file exports ${expected}.`]
  const problems: string[] = []
  if (names.length > 1) {
    problems.push(`exports ${names.map((n) => n.name).join(', ')}; a part file exports ${expected} and nothing else.`)
  }
  const own = names.find((n) => n.name === expected)
  if (!own) problems.push(`does not export ${expected}, the name its file gives it.`)
  else if (own.kind !== 'function') problems.push(`exports ${expected} as a ${own.kind}, not a function component.`)
  return problems
}

/** hook.ts exports only `use*` hooks; a context stays module-private and the root's hook returns it. */
export function hookFileProblems(source: string): string[] {
  return exportsOf(source, 'hook.ts')
    .filter((n) => !(n.kind === 'function' && /^use[A-Z]/.test(n.name)))
    .map((n) => `exports ${n.name} (${n.kind}); hook.ts exports only use* hooks.`)
}

/** lib.ts and lib.tsx export only functions; a type goes in types.ts and a table in constants.ts. */
export function libFileProblems(fileName: string, source: string): string[] {
  return exportsOf(source, fileName)
    .filter((n) => n.kind !== 'function')
    .map((n) => `exports ${n.name} (${n.kind}); ${fileName} exports only functions.`)
}

/**
 * A scrolling overlay's part family is `<Name>Root`, `<Name>Header`, `<Name>Body` and `<Name>Footer`
 * (R-9.2-4), exported from index.tsx; when it has a parts/ folder, those three parts live there.
 */
export function overlayPartProblems(slug: string, indexSource: string, partFiles: readonly string[] | null): string[] {
  const name = pascalOf(slug)
  const exported = new Set(exportsOf(indexSource, 'index.tsx').map((n) => n.name))
  const problems: string[] = []
  for (const part of ['Root', 'Header', 'Body', 'Footer']) {
    if (!exported.has(`${name}${part}`)) problems.push(`index.tsx does not export ${name}${part}, a part every scrolling overlay has.`)
  }
  if (partFiles) {
    for (const part of ['header', 'body', 'footer']) {
      const file = `${slug}-${part}.tsx`
      if (!partFiles.includes(file)) problems.push(`parts/ has no ${file}; a scrolling overlay's parts folder holds its ${part}.`)
    }
  }
  return problems
}
