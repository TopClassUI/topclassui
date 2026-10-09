import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { SKELETON_BOUNDARIES } from '../boundaries.js'
import { Skeleton } from '../index.js'
import type { SkeletonProps } from '../types.js'

const html = (props: SkeletonProps = {}) => markup(<Skeleton {...props} />)

/** The class list of each row, which are the only empty spans inside the root. */
const rowsOf = (out: string) =>
  [...out.matchAll(/<span class="([^"]*)"><\/span>/g)].map((m) => (m[1] ?? '').split(' ').sort())

/** Every class a row wears, written out, so a row that loses its fill or its margins fails. */
const ROW = [
  'animate-pulse', 'bg-neutral-soft', 'block', 'h-[1em]', 'motion-reduce:animate-none',
  'my-[calc((1lh-1em)/2)]', 'rounded-chip',
]
const LAST = [...ROW, 'w-2/3'].sort()

describe('rows', () => {
  it('draws three by default, the playground default', () => {
    expect(rowsOf(html())).toEqual([ROW, ROW, LAST])
  })

  it('keeps a single row at full width, because one line has no ragged end', () => {
    expect(rowsOf(html({ rows: 1 }))).toEqual([ROW])
  })

  it('narrows only the last of two', () => {
    expect(rowsOf(html({ rows: 2 }))).toEqual([ROW, LAST])
  })

  it('draws five for the Suspense sample of the docs', () => {
    expect(rowsOf(html({ rows: 5 }))).toEqual([ROW, ROW, ROW, ROW, LAST])
  })

  it('carries the fill on every row and never on the column around them', () => {
    const out = html({ rows: 4 })
    expect(rowsOf(out).every((row) => row.includes('bg-neutral-soft'))).toBe(true)
    expect(/^<span [^>]*class="([^"]*)"/.exec(out)?.[1]).toBe('flex flex-col w-full')
  })

  it('leaves the rows bare when the caller passes rest props, which belong to the root alone', () => {
    const out = markup(<Skeleton id="notes-loading" style={{ width: '12rem' }} />)
    expect(rowsOf(out)).toEqual([ROW, ROW, LAST])
    expect(out.match(/ id="/g)).toHaveLength(1)
  })

  it('applies to text only: the other shapes draw no rows whatever rows says', () => {
    for (const variant of ['circle', 'rect', 'card'] as const) {
      const out = html({ variant, rows: 5 })
      expect((out.match(/<span/g) ?? []).length, variant).toBe(1)
      expect(out, variant).not.toContain('h-[1em]')
    }
  })
})

describe('the rows clamp', () => {
  it('holds the two bounds the spec names', () => {
    expect(SKELETON_BOUNDARIES).toEqual({ rowsMin: 1, rowsMax: 50 })
  })

  it('draws the maximum itself, so 50 is reachable', () => {
    expect(rowsOf(html({ rows: 50 }))).toHaveLength(50)
  })

  it('stops one past the maximum at the maximum', () => {
    expect(rowsOf(html({ rows: 51 }))).toHaveLength(50)
  })

  it('stops a runaway count at the maximum, so a bad number cannot write a page of spans', () => {
    expect(rowsOf(html({ rows: 1000 }))).toHaveLength(50)
    expect(rowsOf(html({ rows: Number.MAX_SAFE_INTEGER }))).toHaveLength(50)
    expect(rowsOf(html({ rows: Number.POSITIVE_INFINITY }))).toHaveLength(50)
  })

  it('keeps the last row narrow at the maximum', () => {
    expect(rowsOf(html({ rows: 1000 })).at(-1)).toEqual(LAST)
  })

  it('raises zero and below to one row, so the placeholder never vanishes', () => {
    expect(rowsOf(html({ rows: 0 }))).toEqual([ROW])
    expect(rowsOf(html({ rows: -3 }))).toEqual([ROW])
    expect(rowsOf(html({ rows: Number.NEGATIVE_INFINITY }))).toEqual([ROW])
  })

  it('reads NaN as the minimum, which is what clamp() does', () => {
    expect(rowsOf(html({ rows: Number.NaN }))).toEqual([ROW])
  })

  it('drops a fraction, and still narrows the last of the rows it draws', () => {
    expect(rowsOf(html({ rows: 2.7 }))).toEqual([ROW, LAST])
    expect(rowsOf(html({ rows: 1.5 }))).toEqual([ROW])
  })
})
