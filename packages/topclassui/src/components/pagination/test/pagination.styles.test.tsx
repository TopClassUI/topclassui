import { describe, expect, it } from 'vitest'

import { caretDoubleLeft } from '#icons/data/caret-double-left.js'
import { caretDoubleRight } from '#icons/data/caret-double-right.js'
import { caretLeft } from '#icons/data/caret-left.js'
import { caretRight } from '#icons/data/caret-right.js'
import { dotsThree } from '#icons/data/dots-three.js'
import { attr, markup } from '#test/markup.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

const html = (props: Partial<PaginationProps> = {}) =>
  markup(<Pagination value={1} pageCount={12} getHref={blog} {...props} />)

/** The class list of every element one pattern finds, in document order. */
const classesOf = (html_: string, opening: RegExp) =>
  [...html_.matchAll(opening)].map((match) => (attr(match[0], 'class') ?? '').split(' '))

const LINK = /<a [^>]*>/g
const EDGE = /<span [^>]*>/g
const GAP = /<li aria-hidden[^>]*>/g
const CURRENT = /<a [^>]*aria-current[^>]*>/g

/** Page 1 of 12 renders all of them: two edge spans, eight links, one of them current, one gap. */
const cells = (props: Partial<PaginationProps> = {}) => [...classesOf(html(props), LINK), ...classesOf(html(props), EDGE)]

const missing = (wanted: readonly string[], list: readonly string[]) => wanted.filter((cls) => !list.includes(cls))

/** Written out, so losing one axis of the floor or one part of the ring is a failure. */
const FLOOR_HEIGHT = ['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']
const FLOOR_WIDTH = ['min-w-[var(--tc-target-min,24px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]']
const RING = [
  'outline-none',
  'focus-visible:outline-solid',
  'focus-visible:outline-(length:--tc-ring-width)',
  'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring',
]
const TYPE_STEP = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const
/** Figma 138:1269: a cell as wide as its control step and a step or two shorter, written out per size. */
const GEOMETRY = {
  xs: ['px-pad-x-xs'],
  sm: ['min-w-control-sm', 'px-pad-x-xs'],
  md: ['h-control-xs', 'min-w-control-md', 'px-pad-x-xs'],
  lg: ['h-control-sm', 'min-w-control-lg', 'px-pad-x-sm'],
  xl: ['h-control-md', 'min-w-control-xl', 'px-pad-x-sm'],
} as const
const SCALE = /^(size-control-|h-control-|w-control-|min-w-control-|aspect-|px-|text-(xs|sm|base|lg)$)/

describe('every cell is a target a finger can hit (R-5.6-2)', () => {
  it('found the ten cells of page 1 of 12, so an empty list cannot pass', () => {
    expect(cells()).toHaveLength(10)
  })

  it('carries the 24 px floor and the 44 px coarse floor on its height at every size', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      for (const list of cells({ size })) expect(missing(FLOOR_HEIGHT, list), size).toEqual([])
    }
  })

  // e2e/target-size.spec measures the result.
  it('takes its width from a minimum at the control step, above the 24 px floor, so a long number can still widen the cell', () => {
    for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
      for (const list of cells({ size })) {
        expect(list, size).toContain(`min-w-control-${size}`)
        expect(list, size).toContain('pointer-coarse:min-w-[var(--tc-target-coarse,44px)]')
        expect(list, size).not.toContain('min-w-[var(--tc-target-min,24px)]')
      }
    }
  })

  it('keeps both px floors on its width at xs and custom, which set no width of their own', () => {
    for (const size of ['xs', 'custom'] as const) {
      for (const list of cells({ size })) expect(missing(FLOOR_WIDTH, list), size).toEqual([])
    }
  })

  it('carries the whole focus ring at every size', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      for (const list of cells({ size })) expect(missing(RING, list), size).toEqual([])
    }
  })

  it('is a centred box with the control radius, the medium weight and digits of one width', () => {
    for (const list of cells()) {
      expect(missing(['inline-flex', 'items-center', 'justify-center', 'rounded-control', 'font-medium', 'tabular-nums'], list))
        .toEqual([])
    }
  })
})

describe('size', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} gives every cell and the gap the width, the height, the padding and the type step the frame draws`, () => {
      const html_ = html({ size })
      for (const list of [...cells({ size }), ...classesOf(html_, GAP)]) {
        expect(list.filter((cls) => SCALE.test(cls)).sort(), size).toEqual([...GEOMETRY[size], TYPE_STEP[size]].sort())
      }
    })

    it(`${size} reports itself on data-size`, () => {
      expect(attr(html({ size }), 'data-size')).toBe(size)
    })
  }

  it('is md when none is passed, like every other control (R-5.7-2)', () => {
    expect(attr(html(), 'data-size')).toBe('md')
    for (const list of cells()) expect(list).toContain('h-control-xs')
  })

  it('custom emits no size class and no type step, on a cell or on the gap (R-5.7-2)', () => {
    const html_ = html({ size: 'custom' })
    expect(attr(html_, 'data-size')).toBe('custom')
    for (const list of [...cells({ size: 'custom' }), ...classesOf(html_, GAP)]) {
      expect(list.filter((cls) => SCALE.test(cls))).toEqual([])
    }
  })
})

describe('the current page and the others', () => {
  it('fills the current page with the primary solid pair', () => {
    const [current] = classesOf(html({ value: 6 }), CURRENT)
    expect(current).toContain('bg-primary-solid')
    expect(current).toContain('text-primary-on-solid')
    expect(current).not.toContain('text-body')
    expect(current).not.toContain('border-line')
  })

  it('strokes every other link and both edge spans with the hairline of Figma 138:1269, in body text', () => {
    const others = cells({ value: 1 }).filter((list) => !list.includes('bg-primary-solid'))
    expect(others).toHaveLength(9)
    for (const list of others) {
      expect(missing(['border-(length:--tc-line-width)', 'border-line', 'text-body'], list)).toEqual([])
      expect(list).not.toContain('border-line-strong')
    }
  })

  it('fills one cell only', () => {
    expect(cells({ value: 6 }).filter((list) => list.includes('bg-primary-solid'))).toHaveLength(1)
  })
})

describe('an edge span is dimmed and takes no pointer', () => {
  it('carries both data-disabled classes, which the attribute beside them switches on', () => {
    const edges = classesOf(html({ value: 1 }), EDGE)
    expect(edges).toHaveLength(2)
    for (const list of edges) {
      expect(list).toContain('data-disabled:opacity-50')
      expect(list).toContain('data-disabled:pointer-events-none')
    }
    expect(html({ value: 1 }).match(/<span [^>]*data-disabled=""/g)).toHaveLength(2)
  })

  it('drops its stroke and the pointer, as the dead edges of Figma 138:1269 do', () => {
    for (const list of classesOf(html({ value: 1 }), EDGE)) {
      expect(list).toContain('data-disabled:border-transparent')
      expect(list).toContain('data-disabled:cursor-default')
    }
  })
})

describe('a link shows the pointer', () => {
  it('on every page link, the current one included', () => {
    const links = classesOf(html({ value: 6 }), LINK)
    expect(links).toHaveLength(9)
    for (const list of links) expect(list).toContain('cursor-pointer')
  })
})

describe('a gap is a mark, not a control', () => {
  it('carries no floor, no ring, no stroke, no hover and no pointer', () => {
    const [gap] = classesOf(html(), GAP)
    expect(gap).toContain('text-muted')
    const control = /^(min-h-|pointer-coarse:min-h-|min-w-\[|outline-|focus-visible:|border-|hover:|active:|tone-|transition|cursor-)/
    expect((gap ?? []).filter((cls) => control.test(cls))).toEqual([])
  })
})

describe('the list', () => {
  it('is a wrapping row with the 6 px gap the frame draws at md and the container the compact row measures, so it never scrolls a phone sideways', () => {
    expect(attr(/<ul [^>]*>/.exec(html())?.[0] ?? '', 'class')).toBe('flex flex-wrap items-center @container/pagination gap-1.5 pagination-at-32')
  })

  it('spaces its cells by size: 4 px at xs and custom, 6 at sm and md, 8 at lg and xl', () => {
    const gap = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom') => attr(/<ul [^>]*>/.exec(html({ size }))?.[0] ?? '', 'class')?.split(' ').at(-2)
    expect((['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const).map(gap)).toEqual(['gap-1', 'gap-1.5', 'gap-1.5', 'gap-2', 'gap-2', 'gap-1'])
  })

  it('holds the nav to its cell with max-w-full alone, and puts className after it', () => {
    expect(html().startsWith('<nav aria-label="Pagination" data-size="md" class="max-w-full">')).toBe(true)
    expect(attr(html({ className: 'mt-4 justify-self-end' }), 'class')).toBe('max-w-full mt-4 justify-self-end')
  })
})

describe('direction', () => {
  it('draws first, previous, next and last with the four carets, in that order', () => {
    const paths = [...html({ value: 6 }).matchAll(/<path d="([^"]*)"/g)].map((match) => match[1])
    expect(paths).toEqual([caretDoubleLeft.path, caretLeft.path, dotsThree.path, dotsThree.path, caretRight.path, caretDoubleRight.path])
  })

  it('lets Svg mirror all four in RTL, on a link and on an edge span alike', () => {
    for (const value of [1, 6, 12]) {
      const icons = classesOf(html({ value }).replace(/<li aria-hidden="true"[^>]*><svg [^>]*>/g, ''), /<svg [^>]*>/g)
      expect(icons, String(value)).toHaveLength(4)
      for (const list of icons) expect(list, String(value)).toContain('scale-x-(--tc-dir)')
    }
  })

  it('never mirrors the dots of a gap, which have no direction', () => {
    const gaps = classesOf(html({ value: 6 }), /(?<=<li aria-hidden="true"[^>]*>)<svg [^>]*>/g)
    expect(gaps).toHaveLength(2)
    for (const list of gaps) {
      expect(list).toContain('inline-block')
      expect(list).not.toContain('scale-x-(--tc-dir)')
    }
  })
})
