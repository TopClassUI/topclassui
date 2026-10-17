import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

const html = (props: Partial<PaginationProps> = {}) =>
  markup(<Pagination value={6} pageCount={12} getHref={blog} {...props} />)

/** The class list of every element one pattern finds, in document order. */
const classesOf = (html_: string, opening: RegExp) =>
  [...html_.matchAll(opening)].map((match) => (attr(match[0], 'class') ?? '').split(' '))

const CURRENT = /<a [^>]*aria-current[^>]*>/g
const OTHER = /<a (?![^>]*aria-current)[^>]*>/g

describe('forced colours, which erase the fill that marks the current page', () => {
  const forced = (list: readonly string[] = []) => list.filter((cls) => cls.includes('forced-color')).sort()

  // e2e/pagination.spec measures each: the box, the digit on it, the ring and the pointer.
  it('gives the current page the system pair, painted by itself, at rest and under a pointer', () => {
    const [current] = classesOf(html(), CURRENT)
    expect(forced(current)).toEqual([
      'forced-colors:[--tc-ring:Highlight]',
      'forced-colors:active:bg-[Highlight]',
      'forced-colors:bg-[Highlight]',
      'forced-colors:forced-color-adjust-none',
      'forced-colors:hover:bg-[Highlight]',
      'forced-colors:text-[HighlightText]',
    ])
  })

  it('carries it at every size, custom included', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
      const [current] = classesOf(html({ size }), CURRENT)
      expect(forced(current), size).toHaveLength(6)
    }
  })

  // Page 6 of 12: First, Previous, 1, 5, 7, 12, Next and Last.
  it('leaves every other link to the palette, which keeps a stroke by itself', () => {
    const others = classesOf(html(), OTHER)
    expect(others).toHaveLength(8)
    for (const list of others) expect(forced(list)).toEqual([])
  })

  it('writes a system colour only behind forced-colors, so no mode outside it changes', () => {
    const [current] = classesOf(html(), CURRENT)
    expect((current ?? []).filter((cls) => /Highlight|forced-color-adjust/.test(cls) && !cls.startsWith('forced-colors:'))).toEqual([])
  })
})
