// What `add`, `init` and `diff` share: the files an item writes, after the rewrite, and the state of each.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { posix } from 'node:path'

import type { Files } from './files.js'
import { fileState, sha256, type Config, type FileState } from './lock.js'
import type { Framework } from './detect.js'
import { BASE, iconPath, type IconData, type RegistryItem } from './registry.js'
import { rewriteFile, type RewriteOptions } from './rewrite.js'

export type Examples = 'present' | 'all' | 'none'

export interface Target {
  /** Relative to the copied folder, POSIX. */
  path: string
  from: string
  content: string
}

export interface ItemPlan {
  targets: Target[]
  /** Demos left out, each with the components it would need. */
  skipped: { path: string; needs: string[] }[]
}

/** The files of one item as they land in the app: own files, the demos whose components are all present, the icons. */
export function planItem(
  item: RegistryItem,
  icons: IconData,
  present: ReadonlySet<string>,
  examples: Examples,
  options: RewriteOptions,
  extra: readonly Target[] = [],
): ItemPlan {
  const meta = item.meta.topclassui
  const skipped: ItemPlan['skipped'] = []
  const iconNames = new Set(meta.icons)
  const targets: Target[] = []
  for (const file of item.files) {
    const example = meta.examples[file.path]
    if (example !== undefined) {
      const needs = example.components.filter((c) => !present.has(c))
      if (examples === 'none' || needs.length > 0) {
        skipped.push({ path: file.path, needs })
        continue
      }
      for (const icon of example.icons) iconNames.add(icon)
    }
    targets.push({ path: file.path, from: item.name, content: rewriteFile(file.path, file.content, options) })
  }
  for (const name of [...iconNames].sort()) {
    const path = iconPath(name)
    const source = icons[name]
    if (source !== undefined) targets.push({ path, from: item.name, content: rewriteFile(path, source, options) })
  }
  return { targets: [...targets, ...extra], skipped }
}

export const PROCESS_ENV = 'process-env.d.ts'

/**
 * Files the registry does not hold but a framework needs: Vite inlines `process.env.NODE_ENV` and its
 * template types no Node globals, so the three dev warnings that read it need a declaration there.
 */
export function frameworkTargets(framework: Framework, deps: Record<string, string>): Target[] {
  if (framework !== 'vite-react') return []
  const content =
    deps['@types/node'] === undefined
      ? '// Vite inlines process.env.NODE_ENV; the copies read nothing else from process.\ndeclare var process: { env: { NODE_ENV?: string } }\n'
      : '// Vite inlines process.env.NODE_ENV; the Node types describe it for the copies that read it.\n/// <reference types="node" />\n'
  return [{ path: PROCESS_ENV, from: BASE, content }]
}

export interface Assessed {
  target: Target
  state: FileState
  /** The text on disk, when there is one. */
  local: string | undefined
}

export function assess(files: Files, folder: string, config: Config, targets: readonly Target[]): Assessed[] {
  return targets.map((target) => {
    const abs = posix.join(folder, target.path)
    const local = files.exists(abs) ? files.read(abs) : undefined
    const state = fileState(local === undefined ? undefined : sha256(local), config.lock.files[target.path]?.sha256, sha256(target.content))
    return { target, state, local }
  })
}

/** Lock entries of the given items that no target covers any more: removed upstream. */
export function removedUpstream(config: Config, items: ReadonlySet<string>, targets: readonly Target[]): string[] {
  const covered = new Set(targets.map((t) => t.path))
  return Object.entries(config.lock.files)
    .filter(([path, entry]) => items.has(entry.from) && !covered.has(path))
    .map(([path]) => path)
    .sort()
}

export function writeTarget(folder: string, config: Config, target: Target, version: string): void {
  const abs = posix.join(folder, target.path)
  mkdirSync(posix.dirname(abs), { recursive: true })
  writeFileSync(abs, target.content)
  const from = config.lock.files[target.path]?.from ?? target.from
  config.lock.files[target.path] = { from, version, sha256: sha256(target.content) }
}

export function deleteTarget(folder: string, config: Config, path: string): void {
  rmSync(posix.join(folder, path), { force: true })
  // A lock entry without its file would read as "deleted locally" forever.
  config.lock.files = Object.fromEntries(Object.entries(config.lock.files).filter(([p]) => p !== path))
}

/** The items whose files are in the lock, so a demo knows which of its components are present. */
export function installedItems(config: Config): Set<string> {
  return new Set(Object.values(config.lock.files).map((e) => e.from))
}
