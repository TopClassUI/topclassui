// Plan 3.3 "Dependencies between components": depth first with a visited set, dependencies before dependants.
import type { IndexEntry } from './registry.js'

export interface Resolved {
  name: string
  /** The item that pulled this one in, or null when the user named it. */
  via: string | null
}

export function resolveOrder(index: readonly IndexEntry[], names: readonly string[]): Resolved[] {
  const byName = new Map(index.map((i) => [i.name, i]))
  const done = new Map<string, Resolved>()
  const open = new Set<string>()
  const visit = (name: string, via: string | null, path: string[]) => {
    if (done.has(name)) return
    if (open.has(name)) throw new Error(`registry dependencies form a cycle: ${[...path, name].join(' -> ')}`)
    const entry = byName.get(name)
    if (entry === undefined) throw new Error(`${name} is not in the registry`)
    open.add(name)
    for (const dep of entry.registryDependencies) visit(dep, name, [...path, name])
    open.delete(name)
    done.set(name, { name, via })
  }
  for (const name of names) visit(name, null, [])
  // A name the user typed is theirs even when another item reached it first.
  for (const name of names) {
    const r = done.get(name)
    if (r !== undefined) r.via = null
  }
  return [...done.values()]
}

/** Levenshtein distance, for the three closest names an unknown slug is offered. */
export function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row.push(Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost))
    }
    prev = row
  }
  return prev[b.length] ?? 0
}

export function closest(name: string, candidates: readonly string[], count = 3): string[] {
  return [...candidates].sort((x, y) => distance(name, x) - distance(name, y) || (x < y ? -1 : 1)).slice(0, count)
}
