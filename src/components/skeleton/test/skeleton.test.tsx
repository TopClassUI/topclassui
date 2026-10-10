import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { SKELETON_VARIANTS } from '../constants.js'
import { Skeleton } from '../index.js'
import type { SkeletonProps } from '../types.js'

const html = (props: SkeletonProps = {}) => markup(<Skeleton {...props} />)
const sorted = (list: readonly string[]) => [...list].sort()

/** Every class each root wears, written out: an extra class fails as surely as a missing one. */
const ROOT: Record<string, string[]> = {
  text: ['flex', 'flex-col', 'w-full'],
  circle: [
    'animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)',
    'motion-reduce:animate-none', 'rounded-full', 'shrink-0', 'size-control-md',
  ],
  rect: [
    'animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)',
    'h-control-md', 'motion-reduce:animate-none', 'rounded-control', 'w-full',
  ],
  card: [
    'animate-pulse', 'aspect-5/2', 'bg-neutral-soft', 'block',
    'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none', 'rounded-box', 'w-full',
  ],
}

describe('the element it renders', () => {
  it('is a span, so it can stand in for content inside a line as well as a block', () => {
    for (const variant of SKELETON_VARIANTS) expect(html({ variant }), variant).toMatch(/^<span /)
  })

  it('is hidden from assistive technology on every shape', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(attr(html({ variant }), 'aria-hidden'), variant).toBe('true')
    }
  })

  it('cannot be un-hidden by a caller, because aria-hidden is written after the rest', () => {
    const forced = { 'aria-hidden': false } as SkeletonProps
    for (const variant of SKELETON_VARIANTS) {
      expect(attr(html({ ...forced, variant }), 'aria-hidden'), variant).toBe('true')
    }
  })

  it('has no role and no text, because a placeholder says nothing', () => {
    for (const variant of SKELETON_VARIANTS) {
      const out = html({ variant })
      expect(out, variant).not.toContain('role=')
      expect(out.replace(/<[^>]*>/g, ''), variant).toBe('')
    }
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const out = markup(<Skeleton id="loading-invoice" data-testid="x" title="Invoice" />)
    expect(attr(out, 'id')).toBe('loading-invoice')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'title')).toBe('Invoice')
  })

  it('spreads the rest onto the root of every other shape too', () => {
    for (const variant of ['circle', 'rect', 'card'] as const) {
      const out = markup(<Skeleton variant={variant} id="s" data-testid="x" />)
      expect(attr(out, 'id'), variant).toBe('s')
      expect(attr(out, 'data-testid'), variant).toBe('x')
    }
  })

  it('keeps its own props off the DOM, so rows never becomes an attribute on a span', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(html({ variant, rows: 5 }), variant).not.toMatch(/ (rows|variant)=/)
    }
  })

  it('passes style through to the root on every shape', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(attr(html({ variant, style: { opacity: 0.5 } }), 'style'), variant).toBe('opacity:0.5')
    }
  })
})

describe('the design attributes', () => {
  it('reports its variant, which the docs and the tests read', () => {
    expect(attr(html({ variant: 'text' }), 'data-variant')).toBe('text')
    expect(attr(html({ variant: 'circle' }), 'data-variant')).toBe('circle')
    expect(attr(html({ variant: 'rect' }), 'data-variant')).toBe('rect')
    expect(attr(html({ variant: 'card' }), 'data-variant')).toBe('card')
  })

  it('defaults to text, the shape the docs previewer selects', () => {
    expect(attr(html(), 'data-variant')).toBe('text')
  })

  it('carries no size or tone attribute, because it has neither prop', () => {
    expect(html()).not.toMatch(/data-(size|tone)=/)
  })

  it('carries no state attribute, because a skeleton has no states', () => {
    expect(html()).not.toMatch(/data-(state|disabled|loading|open)/)
  })
})

describe('every shape wears its own classes and no others', () => {
  it('names every variant in the table, so adding one cannot skip coverage', () => {
    expect(Object.keys(ROOT).sort()).toEqual([...SKELETON_VARIANTS].sort())
  })

  for (const variant of SKELETON_VARIANTS) {
    it(`${variant} emits exactly its own set on the root`, () => {
      expect(sorted(classList(html({ variant }))), variant).toEqual(ROOT[variant])
    })
  }

  it('starts at text when no variant is given', () => {
    expect(sorted(classList(html()))).toEqual(['flex', 'flex-col', 'w-full'])
  })

  it('renders a hidden, unsized span rather than throwing for a shape a JS caller made up', () => {
    const out = html({ variant: 'avatar' as never })
    expect(attr(out, 'aria-hidden')).toBe('true')
    expect(sorted(classList(out))).toEqual([
      'animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none',
    ])
  })
})

describe('the whole markup, written out', () => {
  it('is a column of two rows, the last one two thirds wide', () => {
    expect(html({ rows: 2 })).toBe(
      '<span data-variant="text" class="flex flex-col w-full" aria-hidden="true">'
      + '<span class="block h-[1em] my-[calc((1lh-1em)/2)] rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none forced-colors:outline-(length:--tc-line-width)"></span>'
      + '<span class="block h-[1em] my-[calc((1lh-1em)/2)] rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none forced-colors:outline-(length:--tc-line-width) w-2/3"></span>'
      + '</span>',
    )
  })

  it('is one empty filled span for the circle', () => {
    expect(html({ variant: 'circle' })).toBe(
      '<span data-variant="circle" class="block size-control-md shrink-0 rounded-full bg-neutral-soft animate-pulse motion-reduce:animate-none forced-colors:outline-(length:--tc-line-width)" aria-hidden="true"></span>',
    )
  })
})
