import { describe, expect, it } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules, importedNames, inlinePropInterfaces, relativeImportsMissingExtension } from './source-checks.js'

/** The same source with Windows line endings, so a CRLF checkout cannot change a result. */
const crlf = (s: string) => s.replace(/\n/g, '\r\n')

describe.each([
  ['LF', (s: string) => s],
  ['CRLF', crlf],
])('%s line endings', (_name, fix) => {
  it('finds a leading use client', () => {
    expect(hasUseClient(fix("'use client'\nexport function A() {}\n"))).toBe(true)
    expect(hasUseClient(fix('"use client";\nexport function A() {}\n'))).toBe(true)
  })

  it('finds one after a byte order mark, which Windows editors add', () => {
    expect(hasUseClient(fix("﻿'use client'\nexport function A() {}\n"))).toBe(true)
  })

  it('does not see a directive that is not there', () => {
    expect(hasUseClient(fix('export function A() {}\n'))).toBe(false)
  })

  it('catches a use client placed after an import, where it is a dead string', () => {
    const source = fix("import { x } from './x.js'\n'use client'\nexport function A() {}\n")
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(true)
  })

  it('does not call a correct directive late', () => {
    expect(hasLateUseClient(fix("'use client'\nimport { x } from './x.js'\n"))).toBe(false)
  })

  it('reads named imports and drops the type qualifier', () => {
    const source = fix("import { useId, type Ref, use as useCtx } from 'react'\n")
    expect(importedNames(source, 'react')).toEqual(['useId', 'Ref', 'use'])
  })

  it('finds a relative import with no extension', () => {
    const source = fix("import { a } from './lib'\nimport { b } from './ok.js'\n")
    expect(relativeImportsMissingExtension(source)).toEqual(['./lib'])
  })

  it('allows .js, .json and .css', () => {
    const source = fix("import a from './a.js'\nimport b from './b.json'\nimport './c.css'\n")
    expect(relativeImportsMissingExtension(source)).toEqual([])
  })

  it('leaves bare package specifiers alone', () => {
    expect(relativeImportsMissingExtension(fix("import { z } from 'zod'\n"))).toEqual([])
  })
})

describe('importedModules', () => {
  it('sees a bare side-effect import, which is how server-only is written', () => {
    expect(importedModules("import 'server-only'")).toEqual(['server-only'])
  })

  it('sees the named, default and namespace forms', () => {
    expect(importedModules("import { a } from 'x'")).toEqual(['x'])
    expect(importedModules("import a from 'x'")).toEqual(['x'])
    expect(importedModules("import * as a from 'x'")).toEqual(['x'])
  })

  it('sees a re-export, which hands the module on without importing it', () => {
    expect(importedModules("export { a } from 'x'")).toEqual(['x'])
    expect(importedModules("export * from 'x'")).toEqual(['x'])
  })

  it('sees a dynamic import and a require', () => {
    expect(importedModules("const a = () => import('x')")).toEqual(['x'])
    expect(importedModules("const a = require('x')")).toEqual(['x'])
  })

  it('reads both quote styles and tolerates extra whitespace', () => {
    expect(importedModules('import {a} from  "x"')).toEqual(['x'])
    expect(importedModules("import (  'x' )".replace('import (', 'import('))).toEqual(['x'])
  })

  it('lists every module once per import, in source order', () => {
    const source = "import 'a'\nimport { b } from 'b'\nexport * from 'c'\nconst d = () => import('d')"
    expect(importedModules(source)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('reads CRLF the same as LF', () => {
    expect(importedModules("import 'a'\r\nimport { b } from 'b'\r\n")).toEqual(['a', 'b'])
  })
})

describe('relativeImportsMissingExtension', () => {
  it('catches a bare relative import, not only the from form', () => {
    expect(relativeImportsMissingExtension("import './side-effect'")).toEqual(['./side-effect'])
  })

  it('catches a dynamic relative import', () => {
    expect(relativeImportsMissingExtension("const a = () => import('./x')")).toEqual(['./x'])
  })

  it('leaves a bare package specifier alone', () => {
    expect(relativeImportsMissingExtension("import 'server-only'")).toEqual([])
  })
})

describe('inlinePropInterfaces', () => {
  it('catches an interface declared in a component file', () => {
    expect(inlinePropInterfaces('export interface SvgProps { icon: string }')).toEqual(['SvgProps'])
  })

  it('catches the type alias form too', () => {
    expect(inlinePropInterfaces('export type ButtonProps = { tone: string }')).toEqual(['ButtonProps'])
  })

  it('allows a re-export, which is how a component exposes its type', () => {
    expect(inlinePropInterfaces("export type { SvgProps } from './types.js'")).toEqual([])
  })

  it('allows a non-prop type, since only Props is the contract', () => {
    expect(inlinePropInterfaces('export interface IconData { path: string }')).toEqual([])
  })

  it('does not match a name that merely starts with Props', () => {
    expect(inlinePropInterfaces('export interface PropsBag { a: 1 }')).toEqual([])
  })

  it('ignores a non-exported local interface', () => {
    expect(inlinePropInterfaces('interface SvgProps { icon: string }')).toEqual([])
  })

  it('finds every declaration, not only the first', () => {
    const source = 'export interface AProps { a: 1 }\nexport type BProps = { b: 2 }'
    expect(inlinePropInterfaces(source)).toEqual(['AProps', 'BProps'])
  })
})
