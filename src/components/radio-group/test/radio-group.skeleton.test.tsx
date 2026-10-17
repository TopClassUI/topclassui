import { describe, expect, expectTypeOf, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import { RadioGroupSkeleton } from '../skeleton.js'
import type { RadioGroupSkeletonSchemaInput } from '../schema.js'
import type { RadioGroupSkeletonProps } from '../types.js'
import type { Size } from '#shared/contracts/size.js'

const html = (props: RadioGroupSkeletonProps = {}) => markup(<RadioGroupSkeleton {...props} />)
const split = (classes: string | undefined) => (classes ?? '').split(' ')
/** Each radio of the skeleton: the class lists of its row, its target, its circle and its line of text. */
const rows = (props: RadioGroupSkeletonProps = {}) =>
  [...html(props).matchAll(/<span class="([^"]*)"><span class="([^"]*)"><span class="([^"]*)"><\/span><\/span><span class="([^"]*)"><\/span><\/span>/g)]
    .map(([, row, target, circle, line]) => ({ row: split(row), target: split(target), circle: split(circle), line: split(line) }))
const first = (props: RadioGroupSkeletonProps = {}) => rows(props)[0] ?? { row: [], target: [], circle: [], line: [] }

/** One radio of a real group, server-rendered: the label, the button and the drawn circle. */
const real = (size: Size = 'md') => {
  const out = markup(<RadioGroupRoot size={size} aria-label="Plan"><RadioGroupItem value="pro">Pro</RadioGroupItem></RadioGroupRoot>)
  const [, row, target, circle] = /<label class="([^"]*)"><button [^>]*class="([^"]*)"[^>]*><span class="([^"]*)"/.exec(out) ?? []
  return { group: classList(out), row: split(row), target: split(target), circle: split(circle) }
}

/** Written out: the circle of the toggle scale and the type step of the label, per size. */
const SIZE = {
  xs: ['size-toggle-xs', 'text-xs'],
  sm: ['size-toggle-sm', 'text-sm'],
  md: ['size-toggle-md', 'text-sm'],
  lg: ['size-toggle-lg', 'text-base'],
  xl: ['size-toggle-xl', 'text-base'],
} as const

const FLOOR = [
  'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
]

describe('RadioGroupSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as RadioGroupSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no button, no input and no label, so nothing in it can take focus: spans around empty spans', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true">(<span class="[^"<>]+"><span class="[^"<>]+"><span class="[^"<>]+"><\/span><\/span><span class="[^"<>]+"><\/span><\/span>){3}<\/span>$/)
  })

  it('keeps the target floor of a radio, 24 px and 44 under a finger, around each circle', () => {
    for (const name of FLOOR) {
      for (const { target } of rows()) expect(target, name).toContain(name)
      expect(real().target, name).toContain(name)
    }
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the circle and the type step of an ${size} radio`, () => {
      const [circle, text] = SIZE[size]
      expect(first({ size }).circle).toContain(circle)
      expect(first({ size }).row).toContain(text)
      expect(real(size).circle).toContain(circle)
      expect(real(size).row).toContain(text)
    })
  }

  it('starts at md, vertical and three radios, as the docs stage draws', () => {
    expect(rows()).toHaveLength(3)
    expect(first().circle).toContain('size-toggle-md')
    expect(classList(html())).toEqual(expect.arrayContaining(['flex-col', 'gap-2.5']))
  })

  it('lays the radios out as the group does: a column, or a row that wraps', () => {
    expect(classList(html({ orientation: 'horizontal' }))).toEqual(expect.arrayContaining(['flex-row', 'flex-wrap', 'gap-x-4', 'gap-y-2.5']))
    const horizontal = markup(<RadioGroupRoot orientation="horizontal" aria-label="Plan"><RadioGroupItem value="pro">Pro</RadioGroupItem></RadioGroupRoot>)
    expect(classList(horizontal)).toEqual(expect.arrayContaining(['flex-row', 'flex-wrap', 'gap-x-4', 'gap-y-2.5']))
    expect(real().group).toEqual(expect.arrayContaining(['flex-col', 'gap-2.5']))
  })

  it('puts the circle and the line in a row the way a radio sits beside its text', () => {
    expect(first().row).toEqual(expect.arrayContaining(['inline-flex', 'items-center', 'gap-2']))
    expect(real().row).toEqual(expect.arrayContaining(['inline-flex', 'items-center', 'gap-2']))
  })

  it('holds as many radios as asked, clamped to 1 and 100 and never a part of one', () => {
    expect(rows({ items: 5 })).toHaveLength(5)
    expect(rows({ items: 0 })).toHaveLength(1)
    expect(rows({ items: Number.NaN })).toHaveLength(1)
    expect(rows({ items: 1000 })).toHaveLength(100)
    expect(rows({ items: 2.5 })).toHaveLength(2)
  })

  it('types items as the skeleton schema does, so the prop and its bound cannot drift apart (R-8.3-4)', () => {
    expectTypeOf<RadioGroupSkeletonProps['items']>().toEqualTypeOf<RadioGroupSkeletonSchemaInput['items'] | undefined>()
  })

  it('emits no size class at custom, so the caller sizes it as they size the group', () => {
    const { row, circle } = first({ size: 'custom' })
    expect([...row, ...circle].filter((c) => /^(size-|text-(xs|sm|base))/.test(c))).toEqual([])
  })

  it('reserves one line of text at a fixed 6em, the label being text it cannot measure', () => {
    expect(first().line).toEqual(expect.arrayContaining(['h-[1em]', 'my-[calc((1lh-1em)/2)]', 'w-[6em]']))
  })

  it('draws a round circle, wears the neutral fill, keeps an edge in forced colours, and pulses unless asked not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    const fill = ['bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)']
    expect(first().circle).toEqual(expect.arrayContaining(['rounded-full', ...fill]))
    expect(first().line).toEqual(expect.arrayContaining(fill))
    expect(real().circle).toContain('rounded-full')
  })

  it('passes className, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' } })
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
  })
})
