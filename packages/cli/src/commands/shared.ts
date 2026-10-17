// What init and add share: the flags, the detected project with its config, and the write-and-lock step.
import { writeFileSync } from 'node:fs'
import { isAbsolute, posix } from 'node:path'

import { readIcons, readIndex, readItem, type Context } from '../context.js'
import { assess, deleteTarget, frameworkTargets, installedItems, planItem, removedUpstream, writeTarget, type Examples, type Target } from '../lib/copy.js'
import { detect, importBase, type Project } from '../lib/detect.js'
import { CliError, EXIT, type ExitCode } from '../lib/errors.js'
import { installCommand, missingPackages, printable } from '../lib/install.js'
import { CONFIG_FILE, parseConfig, replaces, serializeConfig, sha256, type Config } from '../lib/lock.js'
import { unifiedDiff } from '../lib/line-diff.js'
import { interactive } from '../lib/prompt.js'
import { BASE, type RegistryIndex } from '../lib/registry.js'
import { resolveOrder } from '../lib/resolve.js'
import type { RewriteOptions } from '../lib/rewrite.js'
import { toPosix } from '../lib/specifiers.js'

export interface Flags {
  cwd: string | undefined
  yes: boolean
  dryRun: boolean
  noInstall: boolean
  silent: boolean
  force: boolean
  css: string | undefined
  dir: string | undefined
  pm: string | undefined
  imports: string | undefined
  all: boolean
  update: boolean
  overwrite: boolean
  examples: Examples
  json: boolean
  exitCode: boolean
}

export interface Session {
  ctx: Context
  flags: Flags
  index: RegistryIndex
  project: Project
  config: Config | null
  /** Absolute folder of the copies. */
  folder: string
  dir: string
  rewrite: RewriteOptions
  interactive: boolean
  log(line: string): void
}

/** --cwd against the current folder; an absolute one, a Windows drive path included, stands as it is. */
export const projectRoot = (ctx: Context, flags: Flags): string => {
  if (flags.cwd === undefined) return ctx.cwd
  const cwd = toPosix(flags.cwd)
  return posix.normalize(isAbsolute(flags.cwd) ? cwd : posix.join(ctx.cwd, cwd)).replace(/(?<=.)\/$/, '')
}

export function readConfig(ctx: Context, root: string): Config | null {
  const path = posix.join(root, CONFIG_FILE)
  if (!ctx.files.exists(path)) return null
  try {
    return parseConfig(ctx.files.read(path), CONFIG_FILE)
  } catch (error) {
    throw new CliError(error instanceof Error ? error.message : String(error))
  }
}

export function openSession(ctx: Context, flags: Flags, dirOverride?: string): Session {
  const root = projectRoot(ctx, flags)
  if (flags.imports !== undefined && flags.imports !== 'relative') {
    throw new CliError('--imports alias is not built yet (plan choice K4); copies use relative imports.')
  }
  const config = readConfig(ctx, root)
  const project = detect({
    files: ctx.files,
    root,
    env: ctx.env,
    read: ctx.readProject(root),
    dir: dirOverride ?? flags.dir ?? config?.dir,
    pm: flags.pm,
  })
  const dir = project.dir
  return {
    ctx,
    flags,
    index: readIndex(ctx),
    project,
    config,
    folder: posix.join(project.root, dir),
    dir,
    rewrite: { framework: project.framework, moduleResolution: project.moduleResolution, importBase: importBase(project.tsconfig, project.root, dir) },
    interactive: interactive(flags.yes, ctx.env, ctx.tty),
    log: (line) => {
      if (!flags.silent) ctx.out(line)
    },
  }
}

export function saveConfig(session: Session, config: Config): void {
  if (session.flags.dryRun) return
  writeFileSync(posix.join(session.project.root, CONFIG_FILE), serializeConfig(config))
}

export interface ApplyResult {
  written: number
  /** Files left alone because the user edited them and upstream changed too. */
  conflicts: string[]
  packages: Set<string>
}

/**
 * Writes `names` and their registry dependencies into the folder under the five-state rules of plan 3.6.
 * A dependency already present is left as it is unless it is named or `refresh` is set.
 */
export function applyItems(session: Session, config: Config, names: string[], refresh: boolean): ApplyResult {
  const { ctx, flags, index } = session
  const before = installedItems(config)
  const order = resolveOrder(index.items, names).filter((r) => r.via === null || refresh || !before.has(r.name))
  const present = new Set([...before, ...order.map((r) => r.name)])
  const icons = readIcons(ctx)
  const result: ApplyResult = { written: 0, conflicts: [], packages: new Set() }
  const all: Target[] = []
  for (const { name, via } of order) {
    const item = readItem(ctx, name)
    const entry = index.items.find((i) => i.name === name)
    for (const dep of entry?.dependencies ?? []) result.packages.add(dep)
    const extra = name === BASE ? frameworkTargets(session.project.framework, session.project.deps) : []
    const plan = planItem(item, icons, present, flags.examples, session.rewrite, extra)
    all.push(...plan.targets)
    let wrote = 0
    for (const { target, state, local } of assess(ctx.files, session.folder, config, plan.targets)) {
      if (!replaces(state, flags.overwrite)) {
        if (state === 'both changed' || state === 'unknown file') {
          result.conflicts.push(target.path)
          session.log(`  left ${target.path}: ${state === 'unknown file' ? 'not written by topclassui' : 'modified locally, upstream changed'} (--overwrite replaces it)`)
        }
        continue
      }
      if (local !== undefined && state !== 'update available' && !flags.silent) ctx.out(unifiedDiff(target.path, local, target.content))
      if (!flags.dryRun) writeTarget(session.folder, config, target, index.version)
      wrote++
    }
    result.written += wrote
    const place = name === 'base' ? `${session.dir}/` : `${session.dir}/components/${name}/`
    const reason = via === null ? '' : ` (${via} imports it)`
    session.log(`${name} → ${place}${reason}${wrote === 0 ? ', up to date' : ''}`)
    for (const s of plan.skipped) {
      if (flags.examples !== 'none') session.log(`  skipped ${s.path}: needs ${s.needs.join(', ')} (--examples adds them)`)
    }
  }
  for (const path of removedUpstream(config, new Set(order.map((r) => r.name)), all)) {
    const abs = posix.join(session.folder, path)
    const local = ctx.files.exists(abs) ? ctx.files.read(abs) : undefined
    const untouched = local !== undefined && config.lock.files[path]?.sha256 === sha256(local)
    if (flags.overwrite && (untouched || local === undefined)) {
      if (!flags.dryRun) deleteTarget(session.folder, config, path)
      session.log(`  removed ${path}: removed upstream`)
    } else session.log(`  left ${path}: removed upstream${untouched ? '' : ', modified locally'}`)
  }
  config.lock.registry = index.version
  return result
}

/** One install command for every package the copies need and the app lacks; --no-install prints it. */
export async function installPackages(session: Session, wanted: Iterable<string>): Promise<ExitCode> {
  const { ctx, flags, project, index } = session
  const missing = missingPackages(ctx.files, project, wanted, index.packages)
  if (missing.length === 0) return EXIT.ok
  const command = installCommand(project.packageManager.name, missing)
  if (flags.noInstall || flags.dryRun) {
    session.log(`Install them with: ${printable(command)}`)
    return EXIT.ok
  }
  session.log(`Installing: ${printable(command)}`)
  const code = await ctx.run(command[0], command[1], project.root)
  if (code !== 0) {
    ctx.err(`${command[0]} exited with ${String(code)}. Run it yourself: ${printable(command)}`)
    return EXIT.install
  }
  return EXIT.ok
}
