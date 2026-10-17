import { readdirSync, readFileSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

import { DIRECTIONS, MODES, findDemos, pageName } from '../scripts/lib/harness.js'

const ROOT = process.cwd()
const OUT = join(ROOT, '.harness')
const LIST = join(OUT, 'pages.json')
const REBUILD = 'run pnpm harness:build first'
/** What a static page is rendered from: the source, and the two scripts that render it. */
const SOURCES = [join(ROOT, 'src'), join(ROOT, 'scripts', 'build-harness.tsx'), join(ROOT, 'scripts', 'lib', 'harness.ts')]

/** Why a built list of demos is not the one on disk, or null when they are the same. */
export function demoListProblem(built: readonly string[], root: string): string | null {
  const onDisk = findDemos(root).map((demo) => demo.name)
  const [added, removed] = [onDisk.filter((name) => !built.includes(name)), built.filter((name) => !onDisk.includes(name))]
  if (added.length === 0 && removed.length === 0) return null
  return `${REBUILD}: .harness lists ${String(built.length)} demos, src has ${String(onDisk.length)}`
    + ` (not built: ${added.slice(0, 5).join(', ') || 'none'}; gone: ${removed.slice(0, 5).join(', ') || 'none'})`
}

/** The first file, or file under a folder, changed after `builtAt`; null when every one is older. */
export function newerSource(builtAt: number, paths: readonly string[]): string | null {
  for (const path of paths) {
    const files = statSync(path).isDirectory()
      ? readdirSync(path, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name))
      : [path]
    const newer = files.find((file) => statSync(file).mtimeMs > builtAt)
    if (newer) return newer
  }
  return null
}

/** Built by `pnpm harness:build`, which `pnpm test:e2e` runs first; a list that no longer matches src throws. */
export const DEMOS: string[] = JSON.parse(readFileSync(LIST, 'utf8')) as string[]
const listProblem = demoListProblem(DEMOS, ROOT)
if (listProblem) throw new Error(listProblem)

let fresh = false

/** A static page's address. The first call in a worker throws when its source changed after the build. */
export const urlFor = (demo: string, mode: string, direction: string) => {
  if (!fresh) {
    const newer = newerSource(statSync(LIST).mtimeMs, SOURCES)
    if (newer) throw new Error(`${REBUILD}: ${newer} changed after .harness was built`)
    fresh = true
  }
  return pathToFileURL(join(OUT, pageName(demo, mode as never, direction as never))).href
}

export const EVERY_PAGE = DEMOS.flatMap((demo) =>
  MODES.flatMap((mode) => DIRECTIONS.map((direction) => ({ demo, mode, direction }))))
