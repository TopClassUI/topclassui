import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { UNKNOWN_SUBPATH, buildGraph } from '../../scripts/lib/module-graph.js'

/** R-8.3-1: the full zod build is 89 KB gzipped and never ships; zod/mini is 3.4 KB and
 * a client file may load it for layer-2 validation. A server file may load neither. */
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
/** A client half: the files R-5.12-1 names, which run in the browser by design. */
const isClient = (rel: string) => /(^|\/)(client\.tsx|hook\.ts|lib\.tsx?)$/.test(rel)
const relative = (file: string) => file.slice(SRC.length + 1).split('\\').join('/')

describe('zod never reaches the browser', () => {
  const files = walk(SRC)
  const graph = buildGraph(files, process.cwd())

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
      const specifiers = [...graph.specifiers(file)]
      // The full build is 89 KB gzipped and never ships, whatever the file is.
      expect(specifiers, `${rel} reaches the full zod build`).not.toContain('zod')
      const mini = specifiers.filter((p) => p.startsWith('zod/'))
      if (!isClient(rel)) {
        expect(mini, `${rel} is not a client file, so it may not load zod at runtime`).toEqual([])
      } else {
        expect(mini.filter((p) => p !== 'zod/mini'), `${rel} loads a zod subpath that is not mini`).toEqual([])
      }

      const packages = [...graph.packages(file)]
      // A subpath the graph cannot resolve would be followed by nothing at all.
      expect(packages.filter((p) => p.startsWith(UNKNOWN_SUBPATH)), rel).toEqual([])
    })
  }
})
