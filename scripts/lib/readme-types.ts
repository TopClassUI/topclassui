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
 * A prop belongs to the component when one of its declarations sits under `src/`. It is required when
 * every branch of the union requires it, and one of a group when the group covers every branch, or
 * every branch a literal such as `readOnly: false` picks.
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

  const seen = new Map<string, Seen>()
  branches.forEach((branch, index) => {
    for (const member of checker.getPropertiesOfType(branch)) {
      // An intersection with React's attributes lists React's declaration first, so look at all of them.
      const own = member.declarations?.find((d) => d.getSourceFile().fileName.includes('/src/'))
      if (own === undefined) continue
      const optional = (member.flags & ts.SymbolFlags.Optional) !== 0
      const printed = writtenType(own) ?? checker.typeToString(checker.getTypeOfSymbolAtLocation(member, source))
      const doc = own === member.declarations?.[0]
        ? ts.displayPartsToString(member.getDocumentationComment(checker)).trim()
        : jsDocOf(own)
      const prev = seen.get(member.name) ?? { requiredIn: new Set<number>(), type: 'undefined', doc: '' }
      if (!optional) prev.requiredIn.add(index)
      const literal = optional ? undefined : member.declarations?.map(literalOf).find((text) => text !== undefined)
      seen.set(member.name, {
        requiredIn: prev.requiredIn,
        type: prev.type === 'undefined' ? printed : prev.type,
        doc: prev.doc === '' ? doc : prev.doc,
        literal: prev.literal ?? literal,
      })
    }
  })

  const all = new Set(branches.map((_, index) => index))
  return [...seen].map(([name, info]) => ({
    name,
    required: info.requiredIn.size === all.size,
    type: `\`${shorten(info.type)}\``,
    default: '-',
    description: info.doc,
    ...groupOf(name, seen, all),
  }))
}

interface Seen { requiredIn: Set<number>; type: string; doc: string; literal?: string | undefined }

const sameSet = (a: Set<number>, b: Set<number>) => a.size === b.size && [...a].every((n) => b.has(n))

/**
 * The props that stand in for this one where it is optional, when together they cover every branch,
 * or every branch some other prop's literal picks: then the row says `when readOnly={false}`.
 */
function groupOf(name: string, seen: Map<string, Seen>, all: Set<number>): { oneOf?: string[]; when?: string } {
  const own = seen.get(name)?.requiredIn ?? new Set<number>()
  if (own.size === 0 || own.size === all.size) return {}
  const others = [...seen]
    .filter(([other, info]) => other !== name && info.requiredIn.size > 0 && info.requiredIn.size < all.size
      && [...info.requiredIn].every((branch) => !own.has(branch)))
    .map(([other]) => other)
    .sort()
  const covered = new Set([...own, ...others.flatMap((other) => [...(seen.get(other)?.requiredIn ?? [])])])
  const oneOf = others.length > 0 ? { oneOf: others } : {}
  if (sameSet(covered, all)) return oneOf
  const picker = [...seen].find(([other, info]) =>
    other !== name && info.literal !== undefined && sameSet(info.requiredIn, covered))
  if (picker === undefined) return {}
  const [key, info] = picker
  return { ...oneOf, when: info.literal === 'true' ? `\`${key}\`` : `\`${key}={${info.literal ?? ''}}\`` }
}

/** `false` for `readOnly: false` under `src/`: a literal that picks a branch of the union. */
function literalOf(decl: ts.Declaration): string | undefined {
  if (!decl.getSourceFile().fileName.includes('/src/') || !ts.isPropertySignature(decl)) return undefined
  return decl.type !== undefined && ts.isLiteralTypeNode(decl.type) ? decl.type.getText() : undefined
}

function jsDocOf(node: ts.Node): string {
  return ts.getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
    .join(' ')
    .trim()
}

/**
 * The type as the author wrote it, which is `IconName` rather than the 84 string literals
 * the checker would expand it to. A mapped or computed member has no written node.
 */
function writtenType(decl: ts.Declaration): string | undefined {
  if (!ts.isPropertySignature(decl) || decl.type === undefined) return undefined
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
