// The registry build's file system half: the library in, dist/registry/ out.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import type { Library, Registry } from './registry.js'

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

export function readLibrary(root: string): Library {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    version: string
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
  const src = join(root, 'src')
  const files = new Map<string, string>()
  for (const file of walk(src)) files.set(relative(src, file).split(sep).join('/'), readFileSync(file, 'utf8'))
  return { version: pkg.version, dependencies: pkg.dependencies ?? {}, peers: pkg.peerDependencies ?? {}, files }
}

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

/** index.json, icon-data.json and one JSON per item, in a fresh `<out>/registry`; returns that folder. */
export function writeRegistry(registry: Registry, out: string): string {
  const dir = join(out, 'registry')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.json'), json(registry.index))
  writeFileSync(join(dir, 'icon-data.json'), json(registry.icons))
  for (const item of registry.items) writeFileSync(join(dir, `${item.name}.json`), json(item))
  return dir
}
