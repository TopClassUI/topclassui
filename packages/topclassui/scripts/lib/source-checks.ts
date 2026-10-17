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
  // The default clause may sit before the braces: import React, { useState } from 'react'.
  const re = new RegExp(`import\\s+(?:[\\w$]+\\s*,\\s*)?\\{([^}]*)\\}\\s*from\\s*['"]${from}['"]`, 'g')
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

/** The local name of a namespace or default import, which hides hooks behind a member access. */
export function namespaceNamesOf(source: string, from: string): string[] {
  const quoted = `['"]${from}['"]`
  const out: string[] = []
  // String.raw, because a template literal silently turns \s into s.
  for (const pattern of [
    String.raw`import\s*\*\s*as\s+([\w$]+)\s*from\s*` + quoted,
    String.raw`import\s+([\w$]+)\s*(?:,[^;]*?)?\s*from\s*` + quoted,
  ]) {
    const re = new RegExp(pattern, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(source))) {
      const name = (m[1] ?? '').trim()
      if (name && name !== 'type') out.push(name)
    }
  }
  return [...new Set(out)]
}

/** Hooks reached through a namespace, such as React.useState, which a named scan misses. */
export function memberHookCalls(source: string, holders: string[]): string[] {
  const out: string[] = []
  for (const holder of holders) {
    const re = new RegExp(String.raw`\b` + holder + String.raw`\s*\.\s*(use[A-Z][\w$]*)`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(source))) out.push(m[1] ?? '')
  }
  return [...new Set(out)]
}

/** Every exported async form, not only `export async function` (R-5.1-5). */
export function exportsAsync(source: string): boolean {
  return /export\s+(?:default\s+)?async\s+function/.test(source)
    || /export\s+(?:const|let|var)\s+[\w$]+\s*(?::[^=]+)?=\s*async\b/.test(source)
    || /export\s+default\s+async\s*\(/.test(source)
}

/**
 * SCREAMING_CASE tables declared outside constants.ts and classes.ts (R-5.12-4). Only a
 * literal counts: `new Set(...)` or `cva(...)` is computed, not data someone goes looking
 * for, and the rule exists so a reader knows which file holds the lookups.
 */
export function screamingConstants(source: string): string[] {
  const name = String.raw`([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+|[A-Z][A-Z0-9]{2,})`
  const literal = String.raw`[{['"\`\d]`
  const re = new RegExp(String.raw`^(?:export\s+)?const\s+${name}\s*(?::[^=]+)?=\s*${literal}`, 'gm')
  return [...source.matchAll(re)].map((m) => m[1] ?? '')
}
