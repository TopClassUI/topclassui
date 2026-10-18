import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { HoldsUnserializable, ServerAction, UnserializableKeys } from './serializable.js'

class Point { constructor(readonly x: number) {} norm(): number { return this.x } }

describe('what crosses the boundary (R-5.1-3)', () => {
  it('lets data, ReactNode and a Server Action through', () => {
    expectTypeOf<HoldsUnserializable<string | number | boolean | null | undefined>>().toEqualTypeOf<false>()
    expectTypeOf<HoldsUnserializable<{ a: string; b: readonly { c: number[] }[] }>>().toEqualTypeOf<false>()
    expectTypeOf<HoldsUnserializable<ReactNode>>().toEqualTypeOf<false>()
    expectTypeOf<HoldsUnserializable<ReactElement>>().toEqualTypeOf<false>()
    expectTypeOf<HoldsUnserializable<ServerAction>>().toEqualTypeOf<false>()
    expectTypeOf<HoldsUnserializable<string | ((formData: FormData) => Promise<void>)>>().toEqualTypeOf<false>()
  })

  it('rejects a function, a nested one, and one in a list', () => {
    expectTypeOf<HoldsUnserializable<() => void>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<string | (() => void)>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<{ a: { b: (n: number) => string } }>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<readonly { cell: () => string }[]>>().toEqualTypeOf<true>()
  })

  it('rejects anything shaped almost like a Server Action', () => {
    expectTypeOf<HoldsUnserializable<(formData: FormData, extra: number) => void>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<(formData: FormData) => string>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<(value: string) => void>>().toEqualTypeOf<true>()
  })

  it('rejects a class instance, which carries methods', () => {
    expectTypeOf<HoldsUnserializable<Point>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<Date>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<Intl.NumberFormat>>().toEqualTypeOf<true>()
  })
})

describe('the keys a prop type lets cross that it should not', () => {
  type Span = ComponentPropsWithRef<'span'>

  it('sets aside ref and the native handlers a root element brings', () => {
    expectTypeOf<UnserializableKeys<Span>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<ComponentPropsWithRef<'form'>>>().toEqualTypeOf<never>()
  })

  it('names a callback a component adds, even under a native handler name', () => {
    expectTypeOf<UnserializableKeys<Span & { onRetry?: () => void }>>().toEqualTypeOf<'onRetry'>()
    expectTypeOf<UnserializableKeys<Omit<Span, 'onChange'> & { onChange: (value: number) => void }>>()
      .toEqualTypeOf<'onChange'>()
    expectTypeOf<UnserializableKeys<Span & { at: Date; render: () => ReactNode }>>().toEqualTypeOf<'at' | 'render'>()
  })
})

const COMPONENTS = new URL('../components/', import.meta.url).pathname

/** The folders whose index.tsx defines a component, read from the source rather than assumed. */
const rendering = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => /^export (async )?function [A-Z]/m.test(readFileSync(join(COMPONENTS, slug, 'index.tsx'), 'utf8')))

describe('every server component has its serializable-props test', () => {
  it('finds the components that render in index.tsx, so an empty list cannot pass', () => {
    expect(rendering).toEqual([
      'alert', 'avatar-group', 'badge', 'banner', 'breadcrumb', 'button', 'code-block', 'empty-state', 'field',
      'form', 'icon', 'input', 'kbd', 'meter', 'pagination', 'progress', 'rating', 'separator',
      'skeleton', 'spinner', 'stepper', 'svg', 'table', 'tag', 'textarea', 'timeline',
    ])
  })

  for (const slug of rendering) {
    it(`${slug}: test/${slug}.serializable.test.ts checks the props of what index.tsx renders`, () => {
      const source = readFileSync(join(COMPONENTS, slug, 'index.tsx'), 'utf8')
      const names = [...source.matchAll(/^export (?:async )?function ([A-Z]\w*)/gm)].map((match) => match[1] ?? '')
      const test = readFileSync(join(COMPONENTS, slug, 'test', `${slug}.serializable.test.ts`), 'utf8')
      expect(names.filter((name) => !test.includes(`UnserializableKeys<${name}Props`)), slug).toEqual([])
    })
  }
})
