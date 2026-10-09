import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { SKELETON_VARIANTS } from '../constants.js'
import { Skeleton } from '../index.js'
import type { SkeletonProps } from '../types.js'

const html = (props: SkeletonProps = {}) => markup(<Skeleton {...props} />)
const classes = (props: SkeletonProps = {}) => classList(html(props))

/** The classes of every row inside a text skeleton. */
const rowClasses = (out: string) =>
  [...out.matchAll(/<span class="([^"]*)"><\/span>/g)].map((m) => m[1] ?? '')

describe('the fill', () => {
  for (const variant of ['circle', 'rect', 'card'] as const) {
    it(`${variant} wears the fill Figma binds, and pulses unless the reader asked it not to`, () => {
      const list = classes({ variant })
      expect(list).toContain('bg-neutral-soft')
      // Without the first, the second passes vacuously: nothing would be animating.
      expect(list).toContain('animate-pulse')
      expect(list).toContain('motion-reduce:animate-none')
    })
  }

  it('leaves the text column unfilled and puts the fill on each row instead', () => {
    const out = html()
    expect(classList(out).filter((c) => /^(bg-|animate-|motion-reduce:)/.test(c))).toEqual([])
    for (const row of rowClasses(out)) {
      expect(row).toContain('bg-neutral-soft')
      expect(row).toContain('animate-pulse')
      expect(row).toContain('motion-reduce:animate-none')
    }
  })
})

describe('the text column', () => {
  it('sets no gap, so the margins of the rows alone make up each line height', () => {
    expect(classes().filter((c) => c.startsWith('gap-'))).toEqual([])
  })

  it('sets no type step, so the font size it inherits decides how tall a row is', () => {
    expect(classes().filter((c) => /^text-(xs|sm|base|lg|xl)$/.test(c))).toEqual([])
  })

  it('aims no class at its rows, so a row keeps its own height of 1em', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(classes({ variant }).filter((c) => /^(\*|\[&)/.test(c) || c.includes(':*')), variant)
        .toEqual([])
    }
  })

  it('sizes each row from the type, not from the control scale', () => {
    for (const row of rowClasses(html())) {
      expect(row.split(' ').filter((c) => c.startsWith('h-'))).toEqual(['h-[1em]'])
    }
  })
})

describe('the consumer className is passed last, so it wins every conflict', () => {
  it('replaces the width of the text column', () => {
    const list = classes({ className: 'w-1/2' })
    expect(list).toContain('w-1/2')
    expect(list).not.toContain('w-full')
  })

  it('sets the type step on the text column, which is how a caller makes the rows taller', () => {
    const out = html({ className: 'text-lg' })
    expect(classList(out)).toContain('text-lg')
    expect(rowClasses(out).some((row) => row.includes('text-lg'))).toBe(false)
  })

  it('replaces the size and the radius of the circle', () => {
    const list = classes({ variant: 'circle', className: 'size-12 rounded-box' })
    expect(list).toContain('size-12')
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('size-control-md')
    expect(list).not.toContain('rounded-full')
  })

  it('replaces the height, the width and the radius of the rect', () => {
    const list = classes({ variant: 'rect', className: 'h-control-sm w-1/2 rounded-chip' })
    expect(list).toContain('h-control-sm')
    expect(list).toContain('w-1/2')
    expect(list).toContain('rounded-chip')
    expect(list).not.toContain('h-control-md')
    expect(list).not.toContain('w-full')
    expect(list).not.toContain('rounded-control')
  })

  it('replaces the ratio, the width and the radius of the card', () => {
    const list = classes({ variant: 'card', className: 'aspect-square w-64 rounded-control' })
    expect(list).toContain('aspect-square')
    expect(list).toContain('w-64')
    expect(list).toContain('rounded-control')
    expect(list).not.toContain('aspect-5/2')
    expect(list).not.toContain('w-full')
    expect(list).not.toContain('rounded-box')
  })

  it('replaces the fill and the pulse of a shape', () => {
    const list = classes({ variant: 'rect', className: 'bg-surface animate-none' })
    expect(list).toContain('bg-surface')
    expect(list).toContain('animate-none')
    expect(list).not.toContain('bg-neutral-soft')
    expect(list).not.toContain('animate-pulse')
  })

  it('keeps a utility that conflicts with nothing', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(classes({ variant, className: 'ms-2' }), variant).toContain('ms-2')
    }
  })
})

describe('what it is not', () => {
  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:)/
    for (const variant of SKELETON_VARIANTS) {
      expect(classes({ variant }).filter((c) => interactive.test(c)), variant).toEqual([])
    }
  })

  it('is never a tab stop', () => {
    for (const variant of SKELETON_VARIANTS) expect(attr(html({ variant }), 'tabindex'), variant).toBeUndefined()
  })

  it('names no palette colour on any shape or row', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const variant of SKELETON_VARIANTS) {
      expect(html({ variant }), variant).not.toMatch(palette)
    }
  })

  it('uses only the logical side of anything, never left or right', () => {
    for (const variant of SKELETON_VARIANTS) {
      expect(html({ variant }), variant).not.toMatch(/\b(ml|mr|pl|pr|left|right)-/)
    }
  })
})
