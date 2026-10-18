// Plan 3.6: the state of every copied file against what this version would write, with patches for upstream changes.
import { posix } from 'node:path'

import type { Context } from '../context.js'
import { readIcons, readIndex, readItem } from '../context.js'
import { assess, frameworkTargets, installedItems, planItem, removedUpstream, type Target } from '../lib/copy.js'
import { CliError, EXIT, type ExitCode } from '../lib/errors.js'
import { unifiedDiff } from '../lib/line-diff.js'
import { CONFIG_FILE, type FileState } from '../lib/lock.js'
import { BASE } from '../lib/registry.js'
import { checkSlugs } from './add.js'
import { openSession, projectRoot, readConfig, type Flags } from './shared.js'

const LABEL: Record<Exclude<FileState, 'new'>, string> = {
  'up to date': 'up to date',
  'update available': 'upstream changed',
  'modified locally': 'modified locally',
  'both changed': 'modified locally, upstream changed',
  'unknown file': 'not written by topclassui, differs from upstream',
}

export function diff(ctx: Context, flags: Flags, slugs: string[]): ExitCode {
  const config = readConfig(ctx, projectRoot(ctx, flags))
  if (config === null) throw new CliError(`No ${CONFIG_FILE} here. Run npx topclassui init first.`)
  const index = readIndex(ctx)
  checkSlugs(index, slugs)
  const session = openSession(ctx, flags, config.dir)
  const present = installedItems(config)
  const names = slugs.length > 0 ? slugs : [...present].sort()
  const icons = readIcons(ctx)
  let differs = false
  const all: Target[] = []
  const say = (line: string) => {
    if (!flags.silent) ctx.out(line)
  }
  for (const name of names) {
    if (!present.has(name)) {
      say(`${name}: not added`)
      differs = true
      continue
    }
    const extra = name === BASE ? frameworkTargets(session.project.framework, session.project.deps) : []
    const plan = planItem(readItem(ctx, name), icons, present, 'present', session.rewrite, extra)
    const known = plan.targets.filter((t) => config.lock.files[t.path] !== undefined || ctx.files.exists(posix.join(session.folder, t.path)) || !t.path.includes('/dummy/'))
    all.push(...known)
    const rows = assess(ctx.files, session.folder, config, known)
    const changed = rows.filter((r) => r.state !== 'up to date')
    say(`${name}: ${changed.length === 0 ? 'up to date' : `${String(changed.length)} of ${String(rows.length)} files differ`}`)
    for (const { target, state, local } of changed) {
      differs = true
      const label = state === 'new' ? (config.lock.files[target.path] === undefined ? 'added upstream' : 'deleted locally') : LABEL[state]
      say(`  ${target.path}: ${label}`)
      if (state === 'update available' || state === 'both changed' || state === 'new') say(unifiedDiff(target.path, local ?? '', target.content))
    }
  }
  for (const path of removedUpstream(config, new Set(names), all)) {
    differs = true
    say(`  ${path}: removed upstream`)
  }
  return differs ? EXIT.differs : EXIT.ok
}
