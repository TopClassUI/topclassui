// pnpm test:mutation - the gate on the gates. See scripts/mutations/index.ts.
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

import { type Outcome, readAnchors, summarise } from './lib/mutate.js'
import { MUTATIONS } from './mutations/index.js'

const ROOT = process.cwd()
const only = process.argv.slice(2).find((a) => !a.startsWith('-'))
const chosen = only ? MUTATIONS.filter((m) => m.label.includes(only)) : MUTATIONS

if (chosen.length === 0) {
  console.error(`mutate: no mutation matches "${String(only)}"`)
  process.exit(1)
}

// A mutation whose anchor has moved silently tests nothing, which is the whole point.
const missing = readAnchors(ROOT, chosen.filter((m) => m.to !== null))
if (missing.length > 0) {
  for (const m of missing) console.error(`error ${m}`)
  console.error(`\nmutate: ${String(missing.length)} mutation(s) no longer match the source.`)
  process.exit(1)
}

const outcomes: Outcome[] = []

for (const mutation of chosen) {
  const dir = mkdtempSync(join(tmpdir(), 'tc-mutate-'))
  try {
    // join, not a literal slash: on Windows the separator is \ and the filter never matched,
    // so cpSync walked into pnpm's symlink store and failed with EPERM.
    const skip = [join(ROOT, 'node_modules'), join(ROOT, '.git'), join(ROOT, '.harness')]
    cpSync(ROOT, dir, {
      recursive: true,
      filter: (src) => !skip.some((prefix) => src === prefix || src.startsWith(prefix + sep)),
    })
    // A junction needs no elevation on Windows, unlike a symlink.
    symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'junction')

    const target = join(dir, mutation.file)
    if (mutation.to === null) unlinkSync(target)
    else writeFileSync(target, readFileSync(target, 'utf8').replace(mutation.from, mutation.to))

    const run = spawnSync('node', [join(ROOT, 'node_modules/vitest/vitest.mjs'), 'run'], {
      cwd: dir,
      encoding: 'utf8',
    })
    outcomes.push({ label: mutation.label, caught: run.status !== 0 })
    console.log(`${run.status === 0 ? 'SURVIVED' : '  caught'}  ${mutation.label}`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

console.log(`\n${summarise(outcomes).split('\n').slice(-1).join('')}`)
if (outcomes.some((o) => !o.caught)) process.exit(1)
