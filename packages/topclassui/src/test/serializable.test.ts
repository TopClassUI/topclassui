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

  it('fails closed on any and unknown, and sets aside only the attributes React itself types as any', () => {
    expectTypeOf<HoldsUnserializable<unknown>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<ReturnType<typeof JSON.parse>>>().toEqualTypeOf<true>()
    expectTypeOf<HoldsUnserializable<{ data: unknown }>>().toEqualTypeOf<true>()
    expectTypeOf<UnserializableKeys<ComponentPropsWithRef<'a'>>>().toEqualTypeOf<never>()
    expectTypeOf<UnserializableKeys<Span & { data: unknown; raw: ReturnType<typeof JSON.parse> }>>().toEqualTypeOf<'data' | 'raw'>()
    expectTypeOf<UnserializableKeys<Omit<ComponentPropsWithRef<'a'>, 'download'> & { download: () => void }>>()
      .toEqualTypeOf<'download'>()
  })
})

const COMPONENTS = new URL('../components/', import.meta.url).pathname

/** What index.tsx renders itself or re-exports from a server part or its skeleton; client.js re-exports are not these. */
function serverNames(source: string): string[] {
  const own = [...source.matchAll(/^export (?:default )?(?:async )?function ([A-Z]\w*)|^export const ([A-Z][a-z]\w*)/gm)]
    .map((match) => match[1] ?? match[2] ?? '')
  const parts = [...source.matchAll(/^export \{([^}]*)\} from '\.\/(?:parts\/[\w-]+|skeleton)\.js'/gm)]
    .flatMap((match) => (match[1] ?? '').split(',').map((name) => name.trim()).filter(Boolean))
  return [...own, ...parts]
}

/** The names whose props the test file never hands to UnserializableKeys. */
function unchecked(names: readonly string[], test: string): string[] {
  return names.filter((name) => !new RegExp(`expectTypeOf<UnserializableKeys<${name}Props[<>]`).test(test))
}

const source = (slug: string) => readFileSync(join(COMPONENTS, slug, 'index.tsx'), 'utf8')

/** The folders whose index.tsx defines or re-exports a server renderer, read from the source rather than assumed. */
const rendering = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => serverNames(source(slug)).length > 0)

describe('the names the coverage reads, on fixtures', () => {
  it('reads every form of a server export and leaves the client re-exports and constants out', () => {
    const fixture = [
      'export function Alpha() {}', 'export async function Beta() {}', 'export default function Gamma() {}',
      'export const Delta = () => null', 'export const DELTA_SIZE = 4', "export { EpsRoot, EpsPart } from './parts/eps-root.js'",
      "export { EpsSkeleton } from './skeleton.js'", "export { EpsLive } from './client.js'", "export { epsVariants } from './variants.js'",
    ].join('\n')
    expect(serverNames(fixture)).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'EpsRoot', 'EpsPart', 'EpsSkeleton'])
  })

  it('counts an assertion only, never a comment or a longer name', () => {
    const test = [
      '// UnserializableKeys<AlphaProps> is pinned below', 'expectTypeOf<UnserializableKeys<BetaPropsX>>()',
      'expectTypeOf<UnserializableKeys<GammaProps>>()', 'expectTypeOf<UnserializableKeys<DeltaProps<{ a: 1 }>>>()',
    ].join('\n')
    expect(unchecked(['Alpha', 'Beta', 'Gamma', 'Delta'], test)).toEqual(['Alpha', 'Beta'])
  })
})

describe('every server component has its serializable-props test', () => {
  it('finds the components that render or re-export a server part, so an empty list cannot pass', () => {
    expect(rendering).toEqual([
      'alert', 'avatar', 'avatar-group', 'badge', 'banner', 'breadcrumb', 'button', 'card', 'code-block', 'empty-state',
      'field', 'form', 'icon', 'input', 'kbd', 'meter', 'navbar', 'pagination', 'progress', 'rating',
      'separator', 'sidebar', 'skeleton', 'spinner', 'stepper', 'svg', 'table', 'tag', 'textarea', 'timeline',
    ])
  })

  for (const slug of rendering) {
    it(`${slug}: test/${slug}.serializable.test.ts checks the props of every server renderer index.tsx exports`, () => {
      const test = readFileSync(join(COMPONENTS, slug, 'test', `${slug}.serializable.test.ts`), 'utf8')
      expect(unchecked(serverNames(source(slug)), test), slug).toEqual([])
    })
  }
})
