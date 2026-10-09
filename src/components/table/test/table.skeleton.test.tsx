import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { TableSkeleton } from '../index.js'
import type { TableSkeletonProps } from '../types.js'

const html = (props: TableSkeletonProps = {}) => markup(<TableSkeleton {...props} />)

/** Every opening tag of one element, so each is counted rather than the first. */
const opening = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>`, 'g'))].map((m) => m[0])

const body = (source: string) => /<tbody>(.*)<\/tbody>/.exec(source)?.[1] ?? ''

/** Body rows and the cells of the first one. */
const shape = (source: string) => [opening(body(source), 'tr').length, opening(/<tr>(.*?)<\/tr>/.exec(body(source))?.[1] ?? '', 'td').length]

describe('the element it renders', () => {
  it('is the box of a table around a real table, so the row heights are the table own', () => {
    expect(html()).toMatch(/^<div [^>]*><table class="w-full border-separate border-spacing-0"><thead><tr>.*<\/tr><\/thead><tbody>.*<\/tbody><\/table><\/div>$/)
  })

  it('is hidden from assistive technology, and nothing can un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as TableSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('is no region and no tab stop, and holds no words and no caption', () => {
    const html_ = html()
    expect(html_).not.toMatch(/role=|tabindex|aria-label|<caption/)
    expect(html_.replace(/<[^>]+>/g, '')).toBe('')
  })

  it('spreads the rest onto the box and merges className last', () => {
    const html_ = markup(<TableSkeleton id="loading" data-testid="x" className="mt-4 rounded-control" />)
    expect(html_).toMatch(/^<div [^>]*id="loading"/)
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(classList(html_)).toEqual(expect.arrayContaining(['mt-4', 'rounded-control']))
    expect(classList(html_)).not.toContain('rounded-box')
  })
})

describe('rows and columns', () => {
  it('holds five rows of four cells under four headers by default', () => {
    expect(shape(html())).toEqual([5, 4])
    expect(opening(/<thead>(.*)<\/thead>/.exec(html())?.[1] ?? '', 'th')).toHaveLength(4)
  })

  it('holds the rows and columns it is asked for', () => {
    expect(shape(html({ rows: 3, columns: 6 }))).toEqual([3, 6])
    expect(shape(html({ rows: 25, columns: 2 }))).toEqual([25, 2])
  })

  it('clamps both to their bounds, so rows={1e6} cannot write a million rows (R-5.7-7)', () => {
    expect(shape(html({ rows: 1_000_000, columns: 1_000 }))).toEqual([100, 50])
    expect(shape(html({ rows: 0, columns: 0 }))).toEqual([1, 1])
    expect(shape(html({ rows: -4, columns: -1 }))).toEqual([1, 1])
    expect(shape(html({ rows: Number.POSITIVE_INFINITY, columns: Number.NaN }))).toEqual([100, 1])
  })

  it('drops a fraction instead of asking for half a row', () => {
    expect(shape(html({ rows: 2.9, columns: 3.2 }))).toEqual([2, 3])
  })
})

describe('it has the dimensions of the table it stands in for', () => {
  it('wears the box without its scrolling: a placeholder with no tab stop must not need one', () => {
    expect(classList(html()).sort()).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', 'overflow-hidden', 'rounded-box',
    ])
  })

  it('wears the header cell and the body cell of the table, class for class', () => {
    expect(classList(opening(html(), 'th')[0] ?? '')).toEqual([
      'px-4', 'py-2.5', 'text-xs', 'font-medium', 'whitespace-nowrap', 'text-muted', 'bg-surface',
    ])
    expect(classList(opening(html(), 'td')[0] ?? '')).toEqual([
      'border-t-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-sm', 'whitespace-nowrap', 'text-body',
    ])
  })

  it('fills each cell with one line of nothing: as tall as the type, margins making up the line height', () => {
    const bars = opening(html({ rows: 2, columns: 2 }), 'span').map((tag) => classList(tag))
    expect(bars).toHaveLength(6)
    for (const bar of bars) {
      expect(bar).toEqual(expect.arrayContaining(['block', 'h-[1em]', 'my-[calc((1lh-1em)/2)]', 'w-full', 'rounded-chip', 'bg-neutral-soft']))
    }
  })

  it('pulses, and stops for reduced motion', () => {
    for (const tag of opening(html({ rows: 1, columns: 1 }), 'span')) {
      expect(classList(tag)).toEqual(expect.arrayContaining(['animate-pulse', 'motion-reduce:animate-none']))
    }
  })

  it('caps the bars by a percentage width, which adds nothing to a column, so a narrow box never overflows', () => {
    const header = opening(/<thead>(.*)<\/thead>/.exec(html())?.[1] ?? '', 'span')[0] ?? ''
    const cell = opening(body(html()), 'span')[0] ?? ''
    expect(classList(header)).toEqual(expect.arrayContaining(['w-full', 'max-w-12']))
    expect(classList(cell)).toEqual(expect.arrayContaining(['w-full', 'max-w-24']))
  })

  it('draws the caption strip only when the real table draws its caption', () => {
    expect(html()).not.toContain('<caption')
    const caption = opening(html({ captionVisible: true }), 'caption')
    expect(caption).toHaveLength(1)
    expect(classList(caption[0] ?? '')).toEqual([
      'border-b-(length:--tc-line-width)', 'border-line', 'px-4', 'py-3', 'text-start', 'text-sm', 'font-medium', 'text-body',
    ])
  })
})
