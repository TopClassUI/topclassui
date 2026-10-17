import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve as resolvePath, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

import { importedModules } from '../../scripts/lib/source-checks.js'
import { DIRECTIONAL, ICON_NAMES, ICONS_COUNT, ICONS_VERSION } from './index.js'

const ICONS_DIR = join(process.cwd(), 'src', 'icons')
const DATA_DIR = join(ICONS_DIR, 'data')

describe('the generated set', () => {
  it('is the eighty-four of docs/icons.md', () => {
    expect(ICON_NAMES).toHaveLength(84)
    expect(ICONS_COUNT).toBe(ICON_NAMES.length)
  })

  it('is sorted and has no duplicates, so the output is stable', () => {
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort((a, b) => a.localeCompare(b, 'en')))
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length)
  })

  it('carries a content hash, so a stale copy is detectable', () => {
    expect(ICONS_VERSION).toMatch(/^[0-9a-f]{12}$/)
  })

  it('has one data module per name and no orphans', () => {
    const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3))
    expect(files.sort()).toEqual([...ICON_NAMES].sort((a, b) => a.localeCompare(b, 'en')))
  })
})

describe('the directional set', () => {
  it('is the sixteen the table names', () => {
    expect(DIRECTIONAL.size).toBe(16)
  })

  it('only contains names that exist', () => {
    expect([...DIRECTIONAL].filter((n) => !ICON_NAMES.includes(n))).toEqual([])
  })

  it('agrees with the directional flag inside each module', () => {
    const wrong: string[] = []
    for (const name of ICON_NAMES) {
      const source = readFileSync(join(DATA_DIR, `${name}.ts`), 'utf8')
      const flagged = /directional: true/.test(source)
      if (flagged !== DIRECTIONAL.has(name)) wrong.push(name)
    }
    expect(wrong).toEqual([])
  })

  it('does not flip a shape that means the same in both scripts', () => {
    for (const name of ['magnifying-glass', 'check', 'clock', 'sort-ascending', 'translate'] as const) {
      expect(DIRECTIONAL.has(name), name).toBe(false)
    }
  })
})

describe('every icon module', () => {
  it('has a non-empty path and the shared viewBox', () => {
    const bad: string[] = []
    for (const name of ICON_NAMES) {
      const source = readFileSync(join(DATA_DIR, `${name}.ts`), 'utf8')
      if (!/viewBox: '0 0 256 256'/.test(source)) bad.push(`${name}: viewBox`)
      if (!/path: '[^']+'/.test(source)) bad.push(`${name}: path`)
      if (/fill="|stroke="|#[0-9a-fA-F]{3}/.test(source)) bad.push(`${name}: colour`)
    }
    expect(bad).toEqual([])
  })

  it('stays small, since the path is inlined into the HTML', () => {
    const biggest = ICON_NAMES
      .map((n) => ({ n, size: statSync(join(DATA_DIR, `${n}.ts`)).size }))
      .sort((a, b) => b.size - a.size)[0]
    expect(biggest?.size).toBeLessThan(2500)
  })
})

/** Follow relative imports only; a bare specifier cannot reach our generated files. */
function reachable(entry: string): Set<string> {
  const seen = new Set<string>()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()
    if (file === undefined || seen.has(file) || !existsSync(file)) continue
    seen.add(file)
    const source = readFileSync(file, 'utf8')
    for (const m of source.matchAll(/from\s+'(\.[^']+)'/g)) {
      const target = resolvePath(dirname(file), (m[1] ?? '').replace(/\.js$/, '.ts'))
      queue.push(target)
      if (!existsSync(target)) queue.push(target.replace(/\.ts$/, '.tsx'))
    }
  }
  return seen
}

describe('R-7-1: the loader map stays on the server', () => {
  it('is not reachable from the icons entry point, which a client file may import', () => {
    const reached = [...reachable(join(ICONS_DIR, 'index.ts'))]
    expect(reached.filter((f) => f.includes('loaders.generated'))).toEqual([])
    expect(reached.filter((f) => f.includes(`${sep}data${sep}`))).toEqual([])
  })

  it('is imported by exactly one source file in the whole library', () => {
    const importers: string[] = []
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)
        if (e.isDirectory()) { walk(p); continue }
        if (!/\.tsx?$/.test(e.name)) continue
        // The predicate the gate uses, so a comment mentioning the map is not a hit.
        if (importedModules(readFileSync(p, 'utf8')).some((m) => m.includes('loaders.generated'))) {
          importers.push(p.slice(process.cwd().length + 1).split(sep).join('/'))
        }
      }
    }
    walk(join(process.cwd(), 'src'))
    expect(importers).toEqual(['src/components/icon/lib.ts'])
  })
})
