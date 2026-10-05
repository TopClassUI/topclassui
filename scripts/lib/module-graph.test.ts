import { describe, expect, it } from 'vitest'

import { blankComments, packageName, readSubpaths, valueImports } from './module-graph.js'

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
