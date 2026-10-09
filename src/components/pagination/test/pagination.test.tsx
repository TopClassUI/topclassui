import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { PAGINATION_DEFAULTS, PAGINATION_GAPS, PAGINATION_SIZES } from '../constants.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

const html = (props: Partial<PaginationProps> = {}) =>
  markup(<Pagination value={3} pageCount={12} getHref={blog} {...props} />)

/** The opening tag of every element of one name, in document order. */
const tags = (html_: string, name: string) => html_.match(new RegExp(`<${name}(?: [^>]*)?>`, 'g')) ?? []

/** What each cell shows: a page number, or the three dots of a gap. */
const shown = (html_: string) => [...html_.matchAll(/>([\d.,]+)<\/(?:a|li)>/g)].map((match) => match[1])

describe('Pagination on the server', () => {
  it('is a nav holding one list', () => {
    const html_ = html()
    expect(html_.startsWith('<nav ')).toBe(true)
    expect(html_.endsWith('</ul></nav>')).toBe(true)
    expect(tags(html_, 'ul')).toHaveLength(1)
  })

  // Preflight sets list-style: none, and Safari with VoiceOver then stops announcing a list.
  it('says role="list" on the ul, so the list survives the reset in Safari', () => {
    expect(tags(html(), 'ul')).toEqual(['<ul role="list" class="flex flex-wrap items-center gap-1">'])
  })

  it('is named by the labels, and reports its size', () => {
    expect(attr(html(), 'aria-label')).toBe('Pagination')
    expect(attr(html(), 'data-size')).toBe('md')
  })

  it('shows page 3 of 12 as five pages, a gap and the last page', () => {
    expect(shown(html())).toEqual(['1', '2', '3', '4', '5', '...', '12'])
  })

  it('shows page 6 of 12 with a gap on each side', () => {
    expect(shown(html({ value: 6 }))).toEqual(['1', '...', '5', '6', '7', '...', '12'])
  })

  it('ships no script, no handler and no inline style', () => {
    expect(html()).not.toMatch(/<script|onclick|style=/i)
  })
})

describe('a gap', () => {
  it('is three dots hidden from assistive technology, on the list item itself', () => {
    const gaps = tags(html({ value: 6 }), 'li').filter((tag) => tag.includes('aria-hidden'))
    expect(gaps).toHaveLength(2)
    for (const gap of gaps) expect(attr(gap, 'aria-hidden')).toBe('true')
  })

  it('is not a link, so it is no tab stop and no touch target', () => {
    expect(html({ value: 6 })).toContain('>...</li>')
    expect(html({ value: 6 })).not.toContain('>...</a>')
  })

  it('does not exist when every page fits', () => {
    expect(shown(html({ pageCount: 7 }))).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(tags(html({ pageCount: 7 }), 'li').filter((tag) => tag.includes('aria-hidden'))).toEqual([])
  })

  it('has two places and no third', () => {
    expect(PAGINATION_GAPS).toEqual(['gap-start', 'gap-end'])
  })
})

describe('the current page', () => {
  it('is the one link with aria-current="page"', () => {
    const current = tags(html(), 'a').filter((tag) => tag.includes('aria-current'))
    expect(current).toHaveLength(1)
    expect(attr(current[0] ?? '', 'aria-current')).toBe('page')
    expect(attr(current[0] ?? '', 'href')).toBe('/blog?page=3')
  })

  it('is still a link, so the list reads the same on every page', () => {
    expect(tags(html(), 'a')).toHaveLength(10)
    expect(tags(html({ value: 1 }), 'a')).toHaveLength(8)
  })
})

describe('the defaults', () => {
  it('are one sibling, one boundary, the md cell of R-5.7-2 and the en locale', () => {
    expect(PAGINATION_DEFAULTS).toEqual({ siblingCount: 1, boundaryCount: 1, size: 'md', locale: 'en' })
  })

  it('apply to an explicit undefined too', () => {
    const html_ = html({ size: undefined, siblingCount: undefined, boundaryCount: undefined, locale: undefined, labels: undefined })
    expect(attr(html_, 'data-size')).toBe('md')
    expect(shown(html_)).toEqual(['1', '2', '3', '4', '5', '...', '12'])
  })

  it('offer the shared size scale', () => {
    expect(PAGINATION_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })
})

describe('two paginations on one page', () => {
  const names = (html_: string) => [...html_.matchAll(/<nav aria-label="([^"]*)"/g)].map((match) => match[1])

  // A server component cannot know it has a twin, so the caller names each: see the README.
  it('share the built-in name until each is given an aria-label of its own', () => {
    expect(names(html() + html())).toEqual(['Pagination', 'Pagination'])
    expect(names(html({ 'aria-label': 'Orders pages, top' }) + html({ 'aria-label': 'Orders pages, bottom' })))
      .toEqual(['Orders pages, top', 'Orders pages, bottom'])
  })
})

describe('the props that are not attributes', () => {
  it('never reach the nav as attributes', () => {
    const html_ = html({ siblingCount: 2, boundaryCount: 2, locale: 'ar', link: <a data-own="" /> })
    const nav = tags(html_, 'nav')[0] ?? ''
    expect(nav).not.toMatch(/getHref|pageCount|siblingCount|boundaryCount|labels|locale|link|value=/i)
  })
})
