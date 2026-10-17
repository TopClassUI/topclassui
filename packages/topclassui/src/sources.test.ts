/**
 * Without @source Tailwind scans none of our source, so a consumer's build emits no
 * component CSS and every component ships unstyled. Nothing else reads these lines.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

let scanned: string[] = []

beforeAll(async () => {
  const compiled = await compileEntry()
  // base is the stylesheet's folder for every directive, so the pattern is what differs.
  scanned = compiled.sources
    .filter((s) => !s.negated)
    .map((s) => resolve(s.base, s.pattern.replace(/[/\\]?\*.*$/, '')))
})

/** A directive names a directory, so anything under one of them is scanned too. */
const covered = (dir: string) =>
  scanned.some((base) => dir === base || dir.startsWith(base + sep))

/** The utilities a component file is written with; path data and labels have none. */
const CLASSY = /['"`][^'"`]*\b(?:bg|text|border|rounded|gap|inline-flex|ps|pe|size)-[a-z[]/

function dirsWithClasses(dir: string, found = new Set<string>()) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) dirsWithClasses(p, found)
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
      if (CLASSY.test(readFileSync(p, 'utf8'))) found.add(dir)
    }
  }
  return found
}

describe('@source reaches every folder that writes classes', () => {
  it('registers the directives at all, rather than them being dead text', () => {
    expect(scanned.length).toBeGreaterThan(0)
  })

  it('covers components, connectors and shared by name', () => {
    for (const name of ['components', 'connectors', 'shared']) {
      expect(covered(join(SRC, name)), name).toBe(true)
    }
  })

  it('covers every folder under src that actually writes classes', () => {
    const missed = [...dirsWithClasses(SRC)]
      .filter((d) => !covered(d))
      .map((d) => relative(ROOT, d).split(sep).join('/'))
    expect(missed).toEqual([])
  })
})
