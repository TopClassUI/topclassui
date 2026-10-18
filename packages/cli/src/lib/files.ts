// What detection reads, behind an interface, so a test describes a project as a plain object.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { posix } from 'node:path'

import { toPosix } from './specifiers.js'

export interface Files {
  exists(path: string): boolean
  isDir(path: string): boolean
  read(path: string): string
  /** The entry names of a folder, or an empty list when it is not one. */
  list(path: string): string[]
}

export const nodeFiles: Files = {
  exists: (path) => existsSync(path),
  isDir: (path) => existsSync(path) && statSync(path).isDirectory(),
  read: (path) => readFileSync(path, 'utf8'),
  list: (path) => (existsSync(path) && statSync(path).isDirectory() ? readdirSync(path) : []),
}

/** A file system held in memory: keys are absolute POSIX paths, folders are implied by them. */
export function memoryFiles(tree: Record<string, string>): Files {
  const files = new Map(Object.entries(tree).map(([k, v]) => [toPosix(k), v]))
  const isDir = (path: string): boolean => {
    const prefix = `${toPosix(path).replace(/\/$/, '')}/`
    return [...files.keys()].some((k) => k.startsWith(prefix))
  }
  return {
    exists: (path) => files.has(toPosix(path)) || isDir(path),
    isDir,
    read: (path) => {
      const text = files.get(toPosix(path))
      if (text === undefined) throw new Error(`ENOENT: ${path}`)
      return text
    },
    list: (path) => {
      const prefix = `${toPosix(path).replace(/\/$/, '')}/`
      const names = new Set<string>()
      for (const k of files.keys()) if (k.startsWith(prefix)) names.add(k.slice(prefix.length).split('/')[0] ?? '')
      return [...names].filter((n) => n !== '')
    },
  }
}

/** Reads JSON, or null when the file is missing; a malformed file is the caller's error to report. */
export function readJson(files: Files, path: string): unknown {
  return files.exists(path) ? JSON.parse(files.read(path)) : null
}

/** The folders from `start` up to the file-system root, nearest first. */
export function ancestors(start: string): string[] {
  const out: string[] = []
  let dir = toPosix(start)
  for (;;) {
    out.push(dir)
    const parent = posix.dirname(dir)
    // posix.dirname('C:') is '.', which would read the process's own folder.
    if (parent === dir || parent === '.') return out
    dir = parent
  }
}
