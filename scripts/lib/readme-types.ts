// Which props a component declares itself, and whether each one is required. The schema
// cannot answer that: a required prop such as IconButton's `label` is a type, not a value.
import { join } from 'node:path'

import ts from 'typescript'

import { type PropRow, mergeRows } from './readme.js'
import type { PartFamily, Reach } from './readme-parts.js'

/** One program for every component, because creating one per folder costs seconds each. */
export function openTypeProgram(root: string, files: string[]): ts.Program {
  const configPath = join(root, 'tsconfig.json')
  const read = ts.readConfigFile(configPath, ts.sys.readFile.bind(ts.sys))
  const parsed = ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, root)
  return ts.createProgram(files, { ...parsed.options, noEmit: true })
}

/**
 * A prop belongs to the component when it is declared under `src/`, not pulled in from
 * React's `button` attributes, and it is required only when every branch of the props
 * union requires it - `render` is required in one branch and absent in the other.
 */
export function ownPropsOf(program: ts.Program, file: string, exportName: string): PropRow[] {
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(file)
  if (!source) return []
  const moduleSymbol = checker.getSymbolAtLocation(source)
  if (!moduleSymbol) return []
  const alias = checker.getExportsOfModule(moduleSymbol).find((e) => e.name === exportName)
  if (!alias) return []

  const declared = checker.getDeclaredTypeOfSymbol(alias)
  const branches = declared.isUnion() ? declared.types : [declared]

  const seen = new Map<string, { required: boolean; type: string; doc: string }>()
  for (const branch of branches) {
    for (const member of checker.getPropertiesOfType(branch)) {
      const where = member.declarations?.[0]?.getSourceFile().fileName ?? ''
      if (!where.includes('/src/')) continue
      const optional = (member.flags & ts.SymbolFlags.Optional) !== 0
      const printed = writtenType(member) ?? checker.typeToString(checker.getTypeOfSymbolAtLocation(member, source))
      const doc = ts.displayPartsToString(member.getDocumentationComment(checker)).trim()
      const prev = seen.get(member.name)
      seen.set(member.name, {
        // Required in every branch, or a caller could satisfy the type without it.
        required: (prev?.required ?? true) && !optional,
        type: prev?.type === undefined || prev.type === 'undefined' ? printed : prev.type,
        doc: prev?.doc === undefined || prev.doc === '' ? doc : prev.doc,
      })
    }
  }

  return [...seen].map(([name, info]) => ({
    name,
    required: info.required,
    type: `\`${shorten(info.type)}\``,
    default: '-',
    description: info.doc,
  }))
}

/**
 * The type as the author wrote it, which is `IconName` rather than the 84 string literals
 * the checker would expand it to. A mapped or computed member has no written node.
 */
function writtenType(member: ts.Symbol): string | undefined {
  const decl = member.declarations?.[0]
  if (decl === undefined || !ts.isPropertySignature(decl) || decl.type === undefined) return undefined
  const text = decl.type.getText().replace(/\s+/g, ' ').trim()
  return text === '' ? undefined : text
}

/**
 * `ReactElement<unknown, string | JSXElementConstructor<any>>` tells a reader nothing it
 * does not already know, so the generic arguments go and the name stays.
 */
function shorten(printed: string): string {
  const withoutUndefined = printed.replace(/ \| undefined$/, '')
  if (withoutUndefined.length <= 48) return withoutUndefined
  const generic = /^([A-Za-z0-9_.]+)</.exec(withoutUndefined)
  return generic?.[1] ?? `${withoutUndefined.slice(0, 45)}...`
}

function exportsOf(program: ts.Program, file: string): ts.Symbol[] {
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(file)
  const moduleSymbol = source ? checker.getSymbolAtLocation(source) : undefined
  return moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []
}

/** The names an index.tsx exports as values, in the order it exports them: types are left out. */
export function valueExportsOf(program: ts.Program, file: string): string[] {
  const checker = program.getTypeChecker()
  return exportsOf(program, file)
    .filter((e) => {
      const target = (e.flags & ts.SymbolFlags.Alias) === 0 ? e : checker.getAliasedSymbol(e)
      return (target.flags & ts.SymbolFlags.Value) !== 0
    })
    .map((e) => e.name)
}

/** Every prop a type accepts, wherever it is declared, Base UI's included. */
export function propNamesOf(program: ts.Program, file: string, exportName: string): Set<string> {
  return propNamesOrNull(program, file, exportName) ?? new Set()
}

function propNamesOrNull(program: ts.Program, file: string, exportName: string): Set<string> | null {
  const checker = program.getTypeChecker()
  const found = exportsOf(program, file).find((e) => e.name === exportName)
  if (!found) return null
  const declared = checker.getDeclaredTypeOfSymbol(found)
  const branches = declared.isUnion() ? declared.types : [declared]
  return new Set(branches.flatMap((branch) => checker.getPropertiesOfType(branch).map((p) => p.name)))
}

/** What `<name>Props` passes on: element attributes, a className alone, nothing, or null with no such type. */
export function reachOf(program: ts.Program, file: string, name: string): Reach | null {
  const accepts = propNamesOrNull(program, file, `${name}Props`)
  if (accepts === null) return null
  if (accepts.has('id')) return 'element'
  return accepts.has('className') ? 'className' : 'none'
}

/**
 * A part family part by part, the Root first: each schema row goes to every part that accepts the
 * prop, and one no part accepts stays on the Root rather than vanish. className is the closing line's.
 */
export function familyOf(
  program: ts.Program, typeFile: string, exported: readonly string[], root: string, fromSchema: PropRow[],
): PartFamily {
  const claimed = new Set<string>()
  const parts = [root, ...exported.filter((name) => name !== root)].map((name) => {
    const accepts = propNamesOf(program, typeFile, `${name}Props`)
    const schemaRows = fromSchema.filter((row) => accepts.has(row.name))
    for (const row of schemaRows) claimed.add(row.name)
    const rows = mergeRows(schemaRows, ownPropsOf(program, typeFile, `${name}Props`))
    return { name, rows: rows.filter((row) => row.name !== 'className'), reach: reachOf(program, typeFile, name) }
  })
  const orphans = fromSchema.filter((row) => !claimed.has(row.name))
  const first = parts[0]
  if (first && orphans.length > 0) parts[0] = { ...first, rows: mergeRows(orphans, first.rows) }
  return { parts }
}
