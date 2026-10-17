// pnpm test:mutation - the gate on the gates. See scripts/mutations/index.ts.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

import { type Mutation, type Outcome, caughtBy, readAnchors, summarise } from './lib/mutate.js'
import { MUTATIONS } from './mutations/index.js'

const ROOT = process.cwd()
const only = process.argv.slice(2).find((a) => !a.startsWith('-'))
// Flags go to vitest, so a crowded machine can ask for fewer workers: pnpm test:mutation tag --maxWorkers=2.
const flags = process.argv.slice(2).filter((a) => a.startsWith('-'))
const chosen = only ? MUTATIONS.filter((m) => m.label.includes(only)) : MUTATIONS

if (chosen.length === 0) {
  console.error(`mutate: no mutation matches "${String(only)}"`)
  process.exit(1)
}

// A mutation whose anchor has moved silently tests nothing, which is the whole point.
const missing = readAnchors(ROOT, chosen)
if (missing.length > 0) {
  for (const m of missing) console.error(`error ${m}`)
  console.error(`\nmutate: ${String(missing.length)} mutation(s) do not find their anchor exactly once.`)
  process.exit(1)
}

/** Copies the repository, applies the mutation if there is one, and judges a vitest run of the copy. */
function caughtIn(mutation: Mutation | null): boolean {
  // The copy keeps the repo layout, so a test that reads docs/ (meta.test reads PLAN 18) finds it.
  const base = mkdtempSync(join(tmpdir(), 'tc-mutate-'))
  const dir = join(base, 'packages', 'topclassui')
  try {
    mkdirSync(dir, { recursive: true })
    symlinkSync(join(ROOT, '..', '..', 'docs'), join(base, 'docs'), 'junction')
    // join, not a literal slash: on Windows the separator is \ and the filter never matched,
    // so cpSync walked into pnpm's symlink store and failed with EPERM.
    const skip = ['node_modules', '.git', '.harness', 'dist', '.pack'].map((name) => join(ROOT, name))
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

    return caughtBy(spawnSync('node', [join(ROOT, 'node_modules/vitest/vitest.mjs'), 'run', ...flags], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' },
      maxBuffer: 1 << 28,
    }))
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
}

// A suite that already fails would catch every mutant, so it runs once untouched first.
if (caughtIn(null)) {
  console.error('mutate: the unmutated suite fails, so no mutant can be judged. Run pnpm test.')
  process.exit(1)
}

const outcomes: Outcome[] = []

for (const mutation of chosen) {
  const caught = caughtIn(mutation)
  outcomes.push({ label: mutation.label, caught })
  console.log(`${caught ? '  caught' : 'SURVIVED'}  ${mutation.label}`)
}

console.log(`\n${summarise(outcomes).split('\n').slice(-1).join('')}`)
if (outcomes.some((o) => !o.caught)) process.exit(1)
