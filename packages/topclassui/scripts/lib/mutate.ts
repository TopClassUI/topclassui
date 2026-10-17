// Mutation testing: break the code on purpose, run the suite, and fail if it
// still passes. A test that survives its own mutation is measuring nothing.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export interface Mutation {
  /** What is being broken, in the words a failure should read in. */
  label: string
  /** Repository-relative file to change, or to delete when `to` is null. */
  file: string
  /** The exact text to replace, found once. When `to` is null the file is deleted, and this is a line it must hold. */
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

/** Every mutation must find its anchor exactly once: a missing one tests nothing, of a repeated one only the first
 * copy is ever mutated, and an empty one matches anywhere. A deletion's anchor proves the file still holds what it names. */
export function readAnchors(root: string, mutations: readonly Mutation[]): string[] {
  const missing: string[] = []
  for (const m of mutations) {
    const path = join(root, m.file)
    if (!existsSync(path)) { missing.push(`${m.label}: ${m.file} does not exist`); continue }
    if (m.from === '') { missing.push(`${m.label}: the anchor is empty, so it matches anywhere in ${m.file}`); continue }
    const found = readFileSync(path, 'utf8').split(m.from).length - 1
    if (found === 0) missing.push(`${m.label}: "${m.from.slice(0, 60)}" is not in ${m.file}`)
    else if (found > 1) missing.push(`${m.label}: "${m.from.slice(0, 60)}" is in ${m.file} ${String(found)} times, and only the first is mutated`)
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

/** What spawnSync returns for a vitest run, as much of it as the verdict reads. */
export interface Run { status: number | null; signal?: string | null; error?: Error | undefined; stdout: string; stderr: string }

/** Whether a run failed a test. A run that crashed, or exited 1 with no test failed, throws: it measured nothing. */
export function caughtBy(run: Run): boolean {
  if (run.error || run.status === null) {
    throw new Error(`mutate: vitest did not finish (${run.error?.message ?? `signal ${String(run.signal)}`})`)
  }
  if (run.status === 0) return false
  // The runner sets NO_COLOR, so the summary line reads as plain text.
  const output = `${run.stdout}\n${run.stderr}`
  if (/^\s*Test(?: Files|s)\s+\d+ failed/m.test(output)) return true
  throw new Error(`mutate: vitest exited ${String(run.status)} with no test failed:\n${output.slice(-2000)}`)
}
