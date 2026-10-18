// Which demos reach a 'use client' file: those hydrate through a client island, the rest stay server HTML with no script.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { LIBRARY } from './library.js'

const ALIASES: Record<string, string> = { '#shared/': 'src/shared/', '#icons/': 'src/icons/', '#components/': 'src/components/' }
const SPECIFIERS = /(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

/** A specifier's source file in the library, or null for a package outside it. */
export function sourceOf(specifier: string, from: string, root = LIBRARY): string | null {
  const alias = Object.keys(ALIASES).find((prefix) => specifier.startsWith(prefix))
  const base = alias === undefined
    ? specifier.startsWith('.') ? resolve(dirname(from), specifier) : null
    : join(root, (ALIASES[alias] ?? '') + specifier.slice(alias.length))
  if (base === null) return null
  const stem = base.replace(/\.js$/, '')
  return ['.tsx', '.ts'].map((ext) => stem + ext).find((file) => existsSync(file)) ?? null
}

/** True when the file, or anything it imports inside the library, says 'use client'. */
export function reachesClient(file: string, root = LIBRARY, seen = new Set<string>()): boolean {
  if (seen.has(file)) return false
  seen.add(file)
  const source = readFileSync(file, 'utf8')
  if (/^\s*['"]use client['"]/.test(source)) return true
  for (const match of source.matchAll(SPECIFIERS)) {
    const target = sourceOf(match[1] ?? match[2] ?? '', file, root)
    if (target !== null && reachesClient(target, root, seen)) return true
  }
  return false
}

export type DemoKind = 'server' | 'client' | 'action'

/** server: no client file, no script. client: hydrates through the site's island. action: a client part beside an inline Server Action, so it renders on the server, from a map of its own. */
export function demoKindOf(file: string, root = LIBRARY): DemoKind {
  if (!reachesClient(file, root)) return 'server'
  return /['"]use server['"]/.test(readFileSync(file, 'utf8')) ? 'action' : 'client'
}
