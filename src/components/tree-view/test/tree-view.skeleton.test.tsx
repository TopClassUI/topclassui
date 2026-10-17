import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { TreeViewSkeleton } from '../index.js'
import type { TreeViewSkeletonProps } from '../types.js'

const html = (props: TreeViewSkeletonProps = {}) => markup(<TreeViewSkeleton {...props} />)

/** Every opening tag of one element, so each is counted rather than the first. */
const opening = (source: string, tag: string) =>
  [...source.matchAll(new RegExp(`<${tag}(?: [^>]*)?>`, 'g'))].map((m) => m[0])

/** The rows: every div but the box. */
const rowsOf = (source: string) => opening(source, 'div').slice(1)

describe('the element it renders', () => {
  it('is a box of rows, each an icon bar and a label bar', () => {
    expect(html({ rows: 1 })).toMatch(/^<div [^>]*><div [^>]*><span [^>]*><\/span><span [^>]*><\/span><\/div><\/div>$/)
  })

  it('is hidden from assistive technology, and nothing can un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as TreeViewSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('is no tree and no tab stop, and holds no words', () => {
    const html_ = html()
    expect(html_).not.toMatch(/role=|tabindex|aria-label|aria-busy/)
    expect(html_.replace(/<[^>]+>/g, '')).toBe('')
  })

  it('spreads the rest onto the box and merges className last', () => {
    const html_ = markup(<TreeViewSkeleton id="loading" data-testid="x" style={{ '--tc-list-rows': 12 }} className="mt-4 rounded-control" />)
    expect(html_).toMatch(/^<div [^>]*id="loading"/)
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'style')).toBe('--tc-list-rows:12')
    expect(classList(html_)).toEqual(expect.arrayContaining(['mt-4', 'rounded-control']))
    expect(classList(html_)).not.toContain('rounded-box')
  })
})

describe('rows', () => {
  it('holds five rows by default', () => {
    expect(rowsOf(html())).toHaveLength(5)
  })

  it('holds the rows it is asked for', () => {
    expect(rowsOf(html({ rows: 3 }))).toHaveLength(3)
    expect(rowsOf(html({ rows: 12 }))).toHaveLength(12)
  })

  it('clamps to the bounds of visibleRows, so rows={1e6} cannot write a million rows (R-5.7-7)', () => {
    expect(rowsOf(html({ rows: 1_000_000 }))).toHaveLength(20)
    expect(rowsOf(html({ rows: 21 }))).toHaveLength(20)
    expect(rowsOf(html({ rows: 0 }))).toHaveLength(1)
    expect(rowsOf(html({ rows: -4 }))).toHaveLength(1)
    expect(rowsOf(html({ rows: Number.POSITIVE_INFINITY }))).toHaveLength(20)
    expect(rowsOf(html({ rows: Number.NaN }))).toHaveLength(1)
  })

  it('drops a fraction instead of asking for half a row', () => {
    expect(rowsOf(html({ rows: 2.9 }))).toHaveLength(2)
  })

  it('indents the rows as a tree, a branch open on two leaves then two roots, repeating', () => {
    const levels = rowsOf(html({ rows: 7 })).map((row) => attr(row, 'style'))
    expect(levels).toEqual([
      '--tc-tree-level:0', '--tc-tree-level:1', '--tc-tree-level:1', '--tc-tree-level:0', '--tc-tree-level:0',
      '--tc-tree-level:0', '--tc-tree-level:1',
    ])
  })
})

describe('it has the dimensions of the tree it stands in for', () => {
  it('wears the box of the tree without its tab stop, ring or scrolling, and is cut where the tree would scroll', () => {
    expect(classList(html()).sort()).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', 'flex', 'flex-col',
      'max-h-[calc(var(--tc-list-rows)*var(--tc-row-height))]', 'min-w-0', 'overflow-hidden', 'p-2',
      'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]', 'rounded-box',
    ])
  })

  it('makes each row one unit tall, 44 px under a finger, and one indent further in per level, as a tree row is', () => {
    for (const row of rowsOf(html({ rows: 2 }))) {
      expect(classList(row).sort()).toEqual([
        'flex', 'gap-1.5', 'h-(--tc-row-height)', 'items-center', 'pe-2',
        'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
        'ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]', 'shrink-0', 'text-sm',
      ])
    }
  })

  it('draws an icon square and a label line as tall as the type in each row', () => {
    const bars = opening(html({ rows: 1 }), 'span').map((tag) => classList(tag))
    expect(bars).toHaveLength(2)
    expect(bars[0]).toEqual(expect.arrayContaining(['block', 'size-3.5', 'shrink-0', 'rounded-chip', 'bg-neutral-soft']))
    expect(bars[1]).toEqual(expect.arrayContaining(['block', 'h-[1em]', 'flex-1', 'rounded-chip', 'bg-neutral-soft']))
  })

  it('caps each label bar by a width that varies by row, so a narrow box squeezes it and never overflows', () => {
    const caps = opening(html({ rows: 6 }), 'span').filter((_, index) => index % 2 === 1)
      .map((tag) => classList(tag).filter((c) => c.startsWith('max-w-')))
    expect(caps).toEqual([['max-w-32'], ['max-w-24'], ['max-w-28'], ['max-w-40'], ['max-w-20'], ['max-w-32']])
  })

  // Forced colours erase the fill, and a bar drawn by its fill alone painted nothing (e2e/skeleton.spec).
  it('keeps an outline under forced colours on every bar, and nowhere else', () => {
    const source = html({ rows: 3 })
    const bars = opening(source, 'span').map((tag) => classList(tag))
    expect(bars).toHaveLength(6)
    for (const bar of bars) expect(bar).toContain('forced-colors:outline-(length:--tc-line-width)')
    const all = [...opening(source, 'div'), ...opening(source, 'span')].flatMap((tag) => classList(tag))
    expect(all.filter((c) => c.includes('outline') && !c.startsWith('forced-colors:'))).toEqual([])
  })

  it('pulses, and stops for reduced motion', () => {
    for (const tag of opening(html({ rows: 1 }), 'span')) {
      expect(classList(tag)).toEqual(expect.arrayContaining(['animate-pulse', 'motion-reduce:animate-none']))
    }
  })
})
