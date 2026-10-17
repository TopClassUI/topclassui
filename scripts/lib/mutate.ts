// Mutation testing: break the code on purpose, run the suite, and fail if it
// still passes. A test that survives its own mutation is measuring nothing.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:net'
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
  /** A guarantee only a browser can see: the row is judged by this Playwright run alone, never by vitest. */
  e2e?: E2e
}

/** `spec` is repository-relative; `grep` is a literal piece of the title of the tests it runs, found in the spec. */
export interface E2e { spec: string; grep: string }

/** `error` is set when the runner failed and the row was never judged. */
export interface Outcome { label: string; caught: boolean; error?: string }

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
    if (m.e2e) missing.push(...readE2e(root, m.label, m.e2e))
  }
  return missing
}

/** A spec that moved, or a grep no title holds, would run no test: Playwright exits 1 and the row reads as caught. */
function readE2e(root: string, label: string, e2e: E2e): string[] {
  const path = join(root, e2e.spec)
  if (!existsSync(path)) return [`${label}: the spec ${e2e.spec} does not exist`]
  if (e2e.grep.trim() === '') return [`${label}: the grep is empty, so it runs all of ${e2e.spec}`]
  if (!readFileSync(path, 'utf8').includes(e2e.grep)) return [`${label}: "${e2e.grep.slice(0, 60)}" is not in ${e2e.spec}`]
  return []
}

export const verdict = (o: Outcome) => (o.error === undefined ? (o.caught ? '  caught' : 'SURVIVED') : '   ERROR')

export function summarise(outcomes: readonly Outcome[]): string {
  const failed = outcomes.filter((o) => o.error !== undefined)
  const survived = outcomes.filter((o) => o.error === undefined && !o.caught)
  const lines = outcomes.map((o) => `${verdict(o)}  ${o.label}${o.error === undefined ? '' : `: ${o.error}`}`)
  lines.push('')
  if (survived.length > 0) lines.push(`mutate: ${String(survived.length)} of ${String(outcomes.length)} survived.`)
  // A runner that failed judged nothing, so its rows count neither as caught nor as survived.
  if (failed.length > 0) lines.push(`mutate: the runner failed on ${String(failed.length)} of ${String(outcomes.length)}, which were never judged.`)
  if (survived.length === 0 && failed.length === 0) lines.push(`mutate: ok, all ${String(outcomes.length)} mutations were caught`)
  return lines.join('\n')
}

/** What spawnSync returns for a vitest run, as much of it as the verdict reads. */
export interface Run { status: number | null; signal?: string | null; error?: Error | undefined; stdout: string; stderr: string }

/** The exit code of a run that finished. One killed, or out of buffer, throws: it measured nothing. */
function finished(run: Run, tool: string): number {
  if (run.error || run.status === null) {
    throw new Error(`mutate: ${tool} did not finish (${run.error?.message ?? `signal ${String(run.signal)}`})`)
  }
  return run.status
}

/** Whether a run failed a test. A run that crashed, or exited 1 with no test failed, throws: it measured nothing. */
export function caughtBy(run: Run): boolean {
  if (finished(run, 'vitest') === 0) return false
  // The runner sets NO_COLOR, so the summary line reads as plain text.
  const output = `${run.stdout}\n${run.stderr}`
  if (/^\s*Test(?: Files|s)\s+\d+ failed/m.test(output)) return true
  throw new Error(`mutate: vitest exited ${String(run.status)} with no test failed:\n${output.slice(-2000)}`)
}

/** Whether a Playwright run failed a test, judged as caughtBy judges vitest. No test run at all throws too. */
export function caughtByE2e(run: Run): boolean {
  if (finished(run, 'playwright') === 0) return false
  // The runner asks for the list reporter, whose summary is one count per line.
  const output = `${run.stdout}\n${run.stderr}`
  if (/^\s*\d+ failed\s*$/m.test(output)) return true
  throw new Error(`mutate: playwright exited ${String(run.status)} with no test failed:\n${output.slice(-2000)}`)
}

/** The Playwright arguments for a row, its grep escaped so a bracket or a dot in a title is read as itself. */
export function e2eArgs(e2e: E2e): string[] {
  return ['test', e2e.spec, '-g', e2e.grep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), '--workers=1', '--reporter=list']
}

/** A port nothing listens on now, asked of the system, so two mutants or two worktrees never share one. */
export function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => { if (address !== null && typeof address === 'object') resolve(address.port); else reject(new Error('mutate: no port')) })
    })
  })
}
