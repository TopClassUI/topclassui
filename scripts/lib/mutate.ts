// Mutation testing: break the code on purpose, run the suite, and fail if it
// still passes. A test that survives its own mutation is measuring nothing.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface Mutation {
  /** What is being broken, in the words a failure should read in. */
  label: string
  /** Repository-relative file to change, or to delete when `to` is null. */
  file: string
  /** The exact text to replace. `null` for `to` deletes the file instead. */
  from: string
  to: string | null
}

export interface Outcome { label: string; caught: boolean; reason?: string }

/** Every mutation must still find its anchor, or it silently tests nothing. */
export function readAnchors(root: string, mutations: readonly Mutation[]): string[] {
  const missing: string[] = []
  for (const m of mutations) {
    const source = readFileSync(join(root, m.file), 'utf8')
    if (!source.includes(m.from)) missing.push(`${m.label}: "${m.from.slice(0, 60)}" is not in ${m.file}`)
  }
  return missing
}

export function summarise(outcomes: readonly Outcome[]): string {
  const survived = outcomes.filter((o) => !o.caught)
  const lines = outcomes.map((o) => `${o.caught ? '  caught' : 'SURVIVED'}  ${o.label}`)
  lines.push('')
  lines.push(survived.length === 0
    ? `mutate: ok, all ${String(outcomes.length)} mutations were caught`
    : `mutate: ${String(survived.length)} of ${String(outcomes.length)} survived.`)
  return lines.join('\n')
}
