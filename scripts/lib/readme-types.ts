// Which props a component declares itself, and whether each one is required. The schema
// cannot answer that: a required prop such as IconButton's `label` is a type, not a value.
import { join } from 'node:path'

import ts from 'typescript'

import type { PropRow } from './readme.js'

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
