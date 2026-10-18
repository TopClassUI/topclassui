// Plan 3.6: topclassui.json, and the five states a copied file can be in.
import { createHash } from 'node:crypto'

import type { Framework, PackageManager } from './detect.js'

export const CONFIG_FILE = 'topclassui.json'

export interface LockEntry {
  from: string
  version: string
  sha256: string
}

export interface Config {
  $schema?: string
  version: 1
  framework: Framework
  css: string
  dir: string
  imports: 'relative'
  packageManager: PackageManager
  lock: { registry: string; files: Record<string, LockEntry> }
}

export const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex')

export type FileState = 'new' | 'up to date' | 'update available' | 'modified locally' | 'both changed' | 'unknown file'

/**
 * `local` is the hash on disk (undefined when absent), `written` the lock's, `upstream` what this
 * version writes now. A file on disk that the lock does not know counts as edited by the user.
 */
export function fileState(local: string | undefined, written: string | undefined, upstream: string): FileState {
  if (local === undefined) return 'new'
  if (local === upstream) return 'up to date'
  if (written === undefined) return 'unknown file'
  if (local === written) return 'update available'
  return written === upstream ? 'modified locally' : 'both changed'
}

/** Whether `add` replaces the file: always for ours untouched, and with --overwrite for edited ones. */
export function replaces(state: FileState, overwrite: boolean): boolean {
  if (state === 'new' || state === 'update available') return true
  return overwrite && (state === 'both changed' || state === 'unknown file')
}

const sortKeys = <T>(record: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))

/** Two-space JSON with a trailing newline and sorted file keys, so its git diffs stay small. */
export function serializeConfig(config: Config): string {
  const { lock, ...rest } = config
  return `${JSON.stringify({ ...rest, lock: { registry: lock.registry, files: sortKeys(lock.files) } }, null, 2)}\n`
}

export function parseConfig(text: string, path: string): Config {
  const value = JSON.parse(text) as Partial<Config>
  if (value.version !== 1 || typeof value.dir !== 'string' || typeof value.css !== 'string' || value.lock === undefined) {
    throw new Error(`${path} is not a topclassui.json this CLI can read; move it aside and run init.`)
  }
  return value as Config
}
