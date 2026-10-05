import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildGraph } from '../../scripts/lib/module-graph.js'

// R-8.3-1: only a schema file may load zod, and nothing may reach one at runtime.
const SRC = join(process.cwd(), 'src')

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

const isSchema = (rel: string) => /(^|\/)[\w.-]*schema\.ts$/.test(rel)
const relative = (file: string) => file.slice(SRC.length + 1).split('\\').join('/')

describe('zod never reaches the browser', () => {
  const files = walk(SRC)
  const graph = buildGraph(files, SRC)

  it('finds files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('has schema files to be the one allowed home for zod', () => {
    expect(files.filter((f) => isSchema(relative(f))).length).toBeGreaterThan(0)
  })

  for (const file of files) {
    const rel = relative(file)
    if (isSchema(rel)) continue

    it(`${rel} cannot reach zod through any value import`, () => {
      const route = [...graph.reachable(file)].filter((f) => isSchema(relative(f)))
      expect(route.map(relative), `${rel} imports a schema file at runtime`).toEqual([])
      expect([...graph.packages(file)]).not.toContain('zod')
    })
  }
})
