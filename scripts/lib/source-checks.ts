// The predicates check-boundaries runs, split out so they can be tested against
// both line endings. Omar develops on Windows and CI runs Linux.

/** A directive only counts as one before any statement; later it is a dead string. */
export function hasUseClient(source: string): boolean {
  const head = source.replace(/^\uFEFF/, '').trimStart()
  return /^(['"])use client\1\s*;?/.test(head)
}

/** A 'use client' that is not first, which compiles as a Server Component and throws at render. */
export function hasLateUseClient(source: string): boolean {
  if (hasUseClient(source)) return false
  return /^[ \t]*(['"])use client\1[ \t]*;?[ \t]*\r?$/m.test(source)
}

/** Named imports from one module, with `type` qualifiers stripped. */
export function importedNames(source: string, from: string): string[] {
  const names: string[] = []
  const re = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${from}['"]`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) {
    for (const part of (m[1] ?? '').split(',')) {
      const name = (part.split(' as ')[0] ?? '').trim()
      if (name && name !== 'type') names.push(name.replace(/^type\s+/, ''))
    }
  }
  return names
}

/** Every form that pulls a module in: bare, named, re-exported, dynamic and require. */
const SPECIFIER = /(?:\bimport\s*\(\s*|\brequire\s*\(\s*|\bfrom\s+|\bimport\s+)['"]([^'"]+)['"]/g

/** Each module id the file imports, however it imports it. */
export function importedModules(source: string): string[] {
  return [...source.matchAll(SPECIFIER)].map((m) => m[1] ?? '')
}

/** Prop interfaces declared in a component file instead of types.ts (R-8.3-4). */
export function inlinePropInterfaces(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:interface|type)\s+(\w*Props)\b/gm)].map((m) => m[1] ?? '')
}

/** Relative specifiers that are missing the .js the emitted ESM needs (R-5.12-5). */
export function relativeImportsMissingExtension(source: string): string[] {
  return importedModules(source)
    .filter((spec) => spec.startsWith('.') && !/\.(js|json|css|svg)$/.test(spec))
}
