import { describe, expect, it } from 'vitest'

import {
  acceptsRenderProp, hasLateUseClient, hasUseClient, importedModules, importedNames, importsRenderElement,
  inlinePropInterfaces, relativeImportsMissingExtension, runtimeUseRender, screamingConstants,
} from './source-checks.js'

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

describe('R-5.12-4: SCREAMING_CASE constants belong in constants.ts or classes.ts', () => {
  it('finds a plain and an exported declaration', () => {
    expect(screamingConstants('const SKELETON_WIDTH = {}')).toEqual(['SKELETON_WIDTH'])
    expect(screamingConstants('export const TONE_CLASS = {}')).toEqual(['TONE_CLASS'])
  })

  it('finds one with a type annotation', () => {
    expect(screamingConstants('const UNFILLED: Variant[] = []')).toEqual(['UNFILLED'])
  })

  it('leaves camelCase and PascalCase alone', () => {
    expect(screamingConstants('const buttonVariants = cva()')).toEqual([])
    expect(screamingConstants('const Button = () => null')).toEqual([])
  })

  it('leaves a short name alone, which is a local and not a table', () => {
    expect(screamingConstants('const T = 1')).toEqual([])
    expect(screamingConstants('const ID = 2')).toEqual([])
  })

  it('does not match a constant mentioned inside a longer line', () => {
    expect(screamingConstants('  return CONTROL_HEIGHT[size]')).toEqual([])
  })
})

describe('a computed constant is not a table', () => {
  it('ignores one built by a call, which nobody reads as data', () => {
    expect(screamingConstants('const CACHEABLE = new Set(keys)')).toEqual([])
    expect(screamingConstants('const RESOLVE = cva(base, {})')).toEqual([])
  })

  it('still catches an object, an array and a plain value', () => {
    expect(screamingConstants('const ON_SOLID = {')).toEqual(['ON_SOLID'])
    expect(screamingConstants("const UNFILLED: Variant[] = ['a']")).toEqual(['UNFILLED'])
    expect(screamingConstants("const PREFIX = 'tc-'")).toEqual(['PREFIX'])
    expect(screamingConstants('const WARN_LINES = 200')).toEqual(['WARN_LINES'])
  })
})

describe('runtimeUseRender (R-5.7-4)', () => {
  it('catches a named import from the subpath and from the barrel', () => {
    expect(runtimeUseRender("import { useRender } from '@base-ui/react/use-render'")).toBe(true)
    expect(runtimeUseRender("import { mergeProps, useRender as r } from '@base-ui/react'")).toBe(true)
  })

  it('catches the subpath in a default, namespace, dynamic or require form', () => {
    expect(runtimeUseRender("import * as R from '@base-ui/react/use-render'")).toBe(true)
    expect(runtimeUseRender("import R from '@base-ui/react/use-render'")).toBe(true)
    expect(runtimeUseRender("const R = await import('@base-ui/react/use-render')")).toBe(true)
    expect(runtimeUseRender("const R = require('@base-ui/react/use-render')")).toBe(true)
  })

  it('catches a member call on a namespace of the barrel', () => {
    expect(runtimeUseRender("import * as Base from '@base-ui/react'\nBase.useRender({ render })")).toBe(true)
  })

  it('lets a type-only import through, which erases', () => {
    expect(runtimeUseRender("import type { useRender } from '@base-ui/react/use-render'")).toBe(false)
    expect(runtimeUseRender("import { type useRender } from '@base-ui/react/use-render'")).toBe(false)
  })

  it('leaves other Base UI imports alone', () => {
    expect(runtimeUseRender("import { mergeProps } from '@base-ui/react/merge-props'")).toBe(false)
    expect(runtimeUseRender("import { Dialog } from '@base-ui/react/dialog'")).toBe(false)
  })
})

describe('acceptsRenderProp (R-5.7-4)', () => {
  it('sees render destructured from the props, on its own line or among others', () => {
    expect(acceptsRenderProp('export function A({ render, ...rest }: AProps) {}')).toBe(true)
    expect(acceptsRenderProp('export function A({\n  size = SIZE,\n  render,\n}: AProps) {}')).toBe(true)
    expect(acceptsRenderProp('export function A({ render = <a />, ...rest }: AProps) {}')).toBe(true)
    expect(acceptsRenderProp('export function A({ render: as }: AProps) {}')).toBe(true)
  })

  it('sees render read from a props object', () => {
    expect(acceptsRenderProp('export function A(props: AProps) { return props.render }')).toBe(true)
  })

  it('does not count a render attribute, a nested key or a renderItem prop', () => {
    expect(acceptsRenderProp('export function A({ to }: AProps) { return <B render={<a href={to} />} /> }')).toBe(false)
    expect(acceptsRenderProp('export function A({ slots = { render: 1 } }: AProps) {}')).toBe(false)
    expect(acceptsRenderProp('export function A({ renderItem }: AProps) {}')).toBe(false)
  })

  it('does not read a comment or a string as a prop', () => {
    expect(acceptsRenderProp("// ({ render }: AProps)\nexport const s = '({ render }: AProps)'")).toBe(false)
  })
})

describe('importsRenderElement (R-5.7-4)', () => {
  it('finds it by alias and by relative path', () => {
    expect(importsRenderElement("import { renderElement } from '#shared/render.js'")).toBe(true)
    expect(importsRenderElement("import { renderElement } from '../../shared/render.js'")).toBe(true)
    expect(importsRenderElement("import { renderElement } from './render.js'")).toBe(true)
  })

  it('does not count a type import or another module', () => {
    expect(importsRenderElement("import type { renderElement } from '#shared/render.js'")).toBe(false)
    expect(importsRenderElement("import { renderElement } from './elsewhere.js'")).toBe(false)
  })
})
