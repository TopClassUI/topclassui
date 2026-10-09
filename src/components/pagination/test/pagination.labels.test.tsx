import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { attr, markup } from '#test/markup.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

const html = (props: Partial<PaginationProps> = {}) =>
  markup(<Pagination value={3} pageCount={12} getHref={blog} {...props} />)

/** Every accessible name in document order: the nav first, then each control and page. */
const names = (html_: string) => [...html_.matchAll(/ aria-label="([^"]*)"/g)].map((match) => match[1])

/** The text of each page link, which is the number as the locale writes it. */
const numbers = (html_: string) => [...html_.matchAll(/>([^<>]+)<\/a>/g)].map((match) => match[1])

describe('the built-in strings come from labels (R-5.11-1)', () => {
  it('are English when nothing is passed', () => {
    expect(names(html())).toEqual([
      'Pagination', 'First page', 'Previous',
      'Page 1', 'Page 2', 'Page 3 of 12', 'Page 4', 'Page 5', 'Page 12',
      'Next', 'Last page',
    ])
  })

  it('are Arabic with the Arabic labels', () => {
    expect(names(html({ labels: ar, locale: 'ar' }))).toEqual([
      'ترقيم الصفحات', 'الصفحة الأولى', 'السابق',
      'صفحة 1', 'صفحة 2', 'صفحة 3 من 12', 'صفحة 4', 'صفحة 5', 'صفحة 12',
      'التالي', 'الصفحة الأخيرة',
    ])
  })

  it('follow a caller who changes one string', () => {
    const labels = { ...en, pagination: { ...en.pagination, next: 'Older posts', label: 'Blog pages' } }
    const all = names(html({ labels }))
    expect(all[0]).toBe('Blog pages')
    expect(all).toContain('Older posts')
    expect(all).not.toContain('Next')
  })

  it('name the edge spans too, so a disabled control still says what it is', () => {
    expect(names(html({ value: 1 })).slice(0, 3)).toEqual(['Pagination', 'First page', 'Previous'])
    expect(names(html({ value: 12 })).slice(-2)).toEqual(['Next', 'Last page'])
  })

  it('say the total once, on the current page, and nowhere else', () => {
    expect(names(html({ value: 6 })).filter((name) => name?.includes('of 12'))).toEqual(['Page 6 of 12'])
  })

  it('never forward the labels object or the locale onto an element', () => {
    expect(html({ labels: ar, locale: 'ar' })).not.toMatch(/labels=|locale=|\[object/)
  })
})

describe('a count label gets the formatter (R-5.11-2)', () => {
  it('hands page and ofPages the number and one Intl.NumberFormat', () => {
    const labels = {
      ...en,
      pagination: {
        ...en.pagination,
        page: (n: number, fmt: Intl.NumberFormat) => `p${fmt.format(n)}`,
        ofPages: (n: number, fmt: Intl.NumberFormat) => `/ ${fmt.format(n)}`,
      },
    }
    const all = names(html({ labels, value: 1000, pageCount: 2000, siblingCount: 0 }))
    expect(all.slice(3, -2)).toEqual(['p1', 'p1,000 / 2,000', 'p2,000'])
  })
})

describe('locale formats the numbers', () => {
  it('groups by the en rules when no locale is passed', () => {
    expect(numbers(html({ value: 1000, pageCount: 2000, siblingCount: 0 }))).toEqual(['1', '1,000', '2,000'])
  })

  it('groups by the rules of the locale it is given', () => {
    expect(numbers(html({ value: 1000, pageCount: 2000, siblingCount: 0, locale: 'de' })))
      .toEqual(['1', '1.000', '2.000'])
  })

  it('writes the name and the visible number with the same formatter (SC 2.5.3)', () => {
    const html_ = html({ value: 1000, pageCount: 2000, siblingCount: 0, locale: 'de' })
    expect(names(html_).slice(3, -2)).toEqual(['Page 1', 'Page 1.000 of 2.000', 'Page 2.000'])
  })

  it('keeps Latin digits for ar, the numbering system the provider defaults to', () => {
    expect(numbers(html({ labels: ar, locale: 'ar' }))).toEqual(['1', '2', '3', '4', '5', '12'])
  })

  it('renders with en for a locale that is no locale, instead of throwing', () => {
    expect(numbers(html({ value: 1000, pageCount: 2000, siblingCount: 0, locale: 'not a locale' })))
      .toEqual(['1', '1,000', '2,000'])
  })

  it('leaves the href alone: getHref gets the number, not the formatted text', () => {
    expect(html({ value: 1000, pageCount: 2000, siblingCount: 0 })).toContain('href="/blog?page=2000"')
  })
})

describe('the name of the nav', () => {
  it('is the caller aria-label in place of the built-in one, whatever the labels say', () => {
    expect(attr(html({ 'aria-label': 'Search results' }), 'aria-label')).toBe('Search results')
    expect(attr(html({ 'aria-label': 'Search results', labels: ar }), 'aria-label')).toBe('Search results')
  })

  it('falls back to the labels for an empty aria-label, which would name nothing', () => {
    expect(attr(html({ 'aria-label': '' }), 'aria-label')).toBe('Pagination')
  })

  it('passes aria-labelledby through, which wins over the label when both are present', () => {
    expect(attr(html({ 'aria-labelledby': 'results-title' }), 'aria-labelledby')).toBe('results-title')
  })
})

describe('the four icons', () => {
  it('are decorative: the link carries the name, so nothing is announced twice', () => {
    const html_ = html({ value: 6 })
    expect(html_.match(/<svg /g)).toHaveLength(4)
    expect(html_.match(/<svg [^>]*aria-hidden="true"/g)).toHaveLength(4)
    expect(html_).not.toContain('role="img"')
  })
})
