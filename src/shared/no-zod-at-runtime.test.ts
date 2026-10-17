import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { UNKNOWN_SUBPATH, buildGraph } from '../../scripts/lib/module-graph.js'

/** R-8.3-1: the full zod build is 89 KB gzipped and never ships; zod/mini is 3.4 KB and a client
 * file may load it for layer-2 validation. A server file may load neither, past the 'use client' it renders. */
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
      expect(specifiers.filter((p) => p.startsWith('zod/') && p !== 'zod/mini'), `${rel} loads a zod subpath that is not mini`).toEqual([])
      if (!isClient(rel)) {
        const own = [...graph.serverSpecifiers(file)].filter((p) => p.startsWith('zod/'))
        expect(own, `${rel} is not a client file, so it may not load zod at runtime`).toEqual([])
      }

      const packages = [...graph.packages(file)]
      // A subpath the graph cannot resolve would be followed by nothing at all.
      expect(packages.filter((p) => p.startsWith(UNKNOWN_SUBPATH)), rel).toEqual([])
    })
  }
})

describe('the guard follows a server file up to the client files it renders, and no further', () => {
  const files = walk(SRC)
  const graph = buildGraph(files, process.cwd())
  const at = (rel: string) => join(SRC, rel)

  it('lets a client file reach zod/mini, through the shared check', () => {
    expect([...graph.specifiers(at('components/textarea/client.tsx'))]).toContain('zod/mini')
  })

  it('sees zod/mini behind the server half of a Textarea, which renders the client holder', () => {
    expect([...graph.specifiers(at('components/textarea/index.tsx'))]).toContain('zod/mini')
  })

  it('does not count it against that server half, which runs none of it', () => {
    expect([...graph.serverSpecifiers(at('components/textarea/index.tsx'))].filter((p) => p.startsWith('zod'))).toEqual([])
  })

  it('counts what a file that is not a client module imports itself, which a server half importing it would run', () => {
    expect([...graph.serverSpecifiers(at('shared/value-check/lib.ts'))]).toEqual(['zod/mini'])
  })
})
