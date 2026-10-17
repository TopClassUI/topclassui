// pnpm test:mutation - the gate on the gates. See scripts/mutations/index.ts.
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

import { type E2e, type Mutation, type Outcome, type Run, caughtBy, caughtByE2e, e2eArgs, freePort, readAnchors, summarise, verdict } from './lib/mutate.js'
import { MUTATIONS } from './mutations/index.js'

const USAGE = 'usage: pnpm test:mutation [label filter] [vitest flags]; a row with e2e is judged by its Playwright spec alone, on a free TC_HARNESS_PORT'

const ROOT = process.cwd()
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(USAGE)
  process.exit(0)
}
const only = process.argv.slice(2).find((a) => !a.startsWith('-'))
// Flags go to vitest, so a crowded machine can ask for fewer workers: pnpm test:mutation tag --maxWorkers=2.
const flags = process.argv.slice(2).filter((a) => a.startsWith('-'))
const chosen = only ? MUTATIONS.filter((m) => m.label.includes(only)) : MUTATIONS

if (chosen.length === 0) {
  console.error(`mutate: no mutation matches "${String(only)}"\n${USAGE}`)
  process.exit(1)
}

// A mutation whose anchor has moved silently tests nothing, which is the whole point.
const missing = readAnchors(ROOT, chosen)
if (missing.length > 0) {
  for (const m of missing) console.error(`error ${m}`)
  console.error(`\nmutate: ${String(missing.length)} mutation(s) do not find their anchor exactly once.`)
  process.exit(1)
}

// FORCE_COLOR wins over NO_COLOR in Node, and a coloured summary line is not read as one.
const env: NodeJS.ProcessEnv = { ...process.env, NO_COLOR: '1' }
delete env['FORCE_COLOR']
const run = (command: string[], cwd: string, extra: Record<string, string> = {}): Run =>
  spawnSync('node', command, { cwd, encoding: 'utf8', env: { ...env, ...extra }, maxBuffer: 1 << 28 })

/** Copies the repository, applies the mutation if there is one, and judges a vitest or a Playwright run of the copy. */
async function caughtIn(mutation: Mutation | null, e2e?: E2e): Promise<boolean> {
  const dir = mkdtempSync(join(tmpdir(), 'tc-mutate-'))
  try {
    // join, not a literal slash: on Windows the separator is \ and the filter never matched,
    // so cpSync walked into pnpm's symlink store and failed with EPERM.
    const skip = ['node_modules', '.git', '.harness', 'test-results', 'playwright-report'].map((name) => join(ROOT, name))
    cpSync(ROOT, dir, {
      recursive: true,
      filter: (src) => !skip.some((prefix) => src === prefix || src.startsWith(prefix + sep)),
    })
    // A junction needs no elevation on Windows, unlike a symlink.
    symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'junction')

    if (mutation) {
      const target = join(dir, mutation.file)
      if (mutation.to === null) unlinkSync(target)
      else writeFileSync(target, readFileSync(target, 'utf8').replace(mutation.from, mutation.to))
    }

    if (!e2e) return caughtBy(run([join(ROOT, 'node_modules/vitest/vitest.mjs'), 'run', ...flags], dir))

    // A harness that does not build ran no spec, so it is the runner failing and not the row caught.
    const build = run([join(ROOT, 'node_modules/tsx/dist/cli.mjs'), 'scripts/build-harness.tsx'], dir)
    if (build.status !== 0) throw new Error(`mutate: the harness did not build:\n${`${build.stdout}\n${build.stderr}`.slice(-2000)}`)
    const port = String(await freePort())
    return caughtByE2e(run([join(ROOT, 'node_modules/@playwright/test/cli.js'), ...e2eArgs(e2e)], dir, { TC_HARNESS_PORT: port }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// A suite that already fails would catch every mutant, so it runs once untouched first, and so does each e2e grep.
if (chosen.some((m) => !m.e2e) && await caughtIn(null)) {
  console.error('mutate: the unmutated suite fails, so no mutant can be judged. Run pnpm test.')
  process.exit(1)
}
const greps = new Map(chosen.flatMap((m) => (m.e2e ? [[`${m.e2e.spec} ${m.e2e.grep}`, m.e2e] as const] : [])))
for (const [name, e2e] of greps) {
  const failed = await caughtIn(null, e2e).catch((error: unknown) => (error instanceof Error ? error.message : String(error)))
  if (failed === false) continue
  console.error(failed === true ? `mutate: ${name} fails unmutated, so no mutant of it can be judged. Run pnpm test:e2e.` : `${failed}\nmutate: the runner failed on the unmutated ${name}, so no row was judged.`)
  process.exit(1)
}

const outcomes: Outcome[] = []

for (const mutation of chosen) {
  const start = Date.now()
  let outcome: Outcome
  try {
    outcome = { label: mutation.label, caught: await caughtIn(mutation, mutation.e2e) }
  } catch (error) {
    outcome = { label: mutation.label, caught: false, error: error instanceof Error ? error.message : String(error) }
  }
  outcomes.push(outcome)
  const seconds = `${String(Math.round((Date.now() - start) / 1000))} s${mutation.e2e ? ', e2e' : ''}`
  console.log(`${verdict(outcome)}  ${mutation.label} (${seconds})${outcome.error === undefined ? '' : `\n${outcome.error}`}`)
}

console.log(`\n${summarise(outcomes).split('\n\n').slice(-1).join('')}`)
if (outcomes.some((o) => !o.caught)) process.exit(1)
