// Mutation testing: break the code on purpose, run the suite, and fail if it
// still passes. A test that survives its own mutation is measuring nothing.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

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

/** The area files of a folder: every .ts in it but index.ts, sorted so the order never depends on the disk. */
export function mutationFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.ts') && e.name !== 'index.ts')
    .map((e) => e.name)
    .sort()
}

/** Every row of every area file. A file that exports no rows is an error, never a silent skip. */
export async function collectMutations(dir: string): Promise<Mutation[]> {
  const rows: Mutation[] = []
  for (const file of mutationFiles(dir)) {
    const path = join(dir, file)
    const found: unknown = (await import(pathToFileURL(path).href)).MUTATIONS
    if (!Array.isArray(found)) throw new Error(`mutate: ${path} must export MUTATIONS, an array of rows`)
    rows.push(...(found as Mutation[]))
  }
  return rows
}

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
