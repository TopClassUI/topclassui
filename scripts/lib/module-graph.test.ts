import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { blankComments, buildGraph, packageName, readSubpaths, valueImports } from './module-graph.js'

// Every row here defeated an earlier version of this scanner.
const CAUGHT: Array<[string, string]> = [
  ['plain', "import { z } from 'zod'"],
  ['no spaces', "import{z}from'zod'"],
  ['leading semicolon', ";import { z } from 'zod'"],
  ['block comment on the same line', "/* R-8.3-1 */ import { z } from 'zod'"],
  ['second import on one line', "import a from 'x'; import { z } from 'zod'"],
  ['bare side-effect', "import 'zod'"],
  ['namespace', "import * as z from 'zod'"],
  ['default', "import z from 'zod'"],
  ['mixed type and value', "import { type A, B } from 'zod'"],
  ['re-export', "export { z } from 'zod'"],
  ['re-export star', "export * from 'zod'"],
  ['re-export namespace', "export * as z from 'zod'"],
  ['dynamic', "await import('zod')"],
  ['dynamic backtick', 'await import(`zod`)'],
  ['require', "require('zod')"],
  ['multi-line', "import {\n  z\n} from 'zod'"],
  ['tab indent', "\timport { z } from 'zod'"],
  ['subpath', "import { z } from 'zod/v4'"],
  ['query suffix', "import { z } from 'zod?raw'"],
]

describe('valueImports sees every way a module can be pulled in', () => {
  for (const [label, source] of CAUGHT) {
    it(`catches the ${label} form`, () => {
      expect(valueImports(source).map(packageName)).toContain('zod')
    })
  }

  it('leaves a type-only import alone, with or without spaces', () => {
    expect(valueImports("import type { A } from 'zod'")).toEqual([])
    expect(valueImports("import type{A}from'zod'")).toEqual([])
    expect(valueImports("export type { A } from 'zod'")).toEqual([])
  })

  it('does not read a commented-out import', () => {
    expect(valueImports("// import { z } from 'zod'")).toEqual([])
    expect(valueImports("/*\nimport { z } from 'zod'\n*/")).toEqual([])
  })

  it('still sees a real import on the line after a comment', () => {
    expect(valueImports("// a note\nimport { z } from 'zod'")).toEqual(['zod'])
  })
})

describe('packageName', () => {
  it('reduces a subpath or query to the package it belongs to', () => {
    expect(packageName('zod/v4')).toBe('zod')
    expect(packageName('zod/mini')).toBe('zod')
    expect(packageName('zod?raw')).toBe('zod')
    expect(packageName('zod')).toBe('zod')
  })

  it('keeps both segments of a scoped package', () => {
    expect(packageName('@base-ui/react/merge-props')).toBe('@base-ui/react')
  })
})

describe('blankComments keeps every later index in place', () => {
  it('replaces a comment with spaces rather than removing it', () => {
    const source = "/* hi */import 'x'"
    expect(blankComments(source)).toHaveLength(source.length)
    expect(blankComments(source).indexOf("import")).toBe(source.indexOf('import'))
  })
})

describe('readSubpaths', () => {
  it('reads every wildcard subpath declared in package.json', () => {
    const prefixes = readSubpaths(process.cwd()).map(([prefix]) => prefix)
    expect(prefixes).toContain('#shared/')
    expect(prefixes).toContain('#test/')
  })
})

describe('buildGraph walks the whole chain, which is the entire point', () => {
  // index -> variants -> schema -> zod, the shape a per-file grep cannot see.
  const root = mkdtempSync(join(tmpdir(), 'graph-'))
  mkdirSync(join(root, 'src'), { recursive: true })
  writeFileSync(join(root, 'package.json'), JSON.stringify({ imports: { '#shared/*': './src/*' } }))
  const file = (name: string, body: string) => {
    const path = join(root, 'src', name)
    writeFileSync(path, body)
    return path
  }
  const schema = file('schema.ts', "import { z } from 'zod'\nexport const s = z")
  const variants = file('variants.ts', "export { s } from './schema.js'\n")
  const index = file('index.tsx', "import { s } from '#shared/variants.js'\nexport const i = s")
  const unrelated = file('plain.ts', "export const p = 1\n")
  const graph = buildGraph([schema, variants, index, unrelated], root)

  it('reaches the far end of a three-file chain', () => {
    expect([...graph.reachable(index)].sort()).toEqual([index, schema, variants].sort())
  })

  it('reports a package two hops away, not only a direct import', () => {
    expect([...graph.packages(index)]).toContain('zod')
    expect([...graph.packages(variants)]).toContain('zod')
  })

  it('leaves a file that imports nothing alone', () => {
    expect([...graph.reachable(unrelated)]).toEqual([unrelated])
    expect([...graph.packages(unrelated)]).toEqual([])
  })

  it('terminates on a cycle rather than hanging', () => {
    const a = file('a.ts', "import './b.js'\n")
    const b = file('b.ts', "import './a.js'\nimport 'zod'\n")
    const cyclic = buildGraph([a, b], root)
    expect([...cyclic.reachable(a)].sort()).toEqual([a, b].sort())
    expect([...cyclic.packages(a)]).toContain('zod')
  })
})
