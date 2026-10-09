import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** A control at an edge: a span that is still announced as a link, and goes nowhere. */
const expectEdge = (name: string) => {
  const control = screen.getByRole('link', { name })
  expect(control.tagName, name).toBe('SPAN')
  expect(control.getAttribute('aria-disabled'), name).toBe('true')
  expect(control.getAttribute('data-disabled'), name).toBe('')
  expect(control.hasAttribute('href'), name).toBe(false)
  expect(control.hasAttribute('rel'), name).toBe(false)
  expect(control.hasAttribute('tabindex'), name).toBe(false)
}

/** A control with a page to go to: an anchor to that page, with no disabled state.
 * rel is written out per call: only Previous and Next name their place in the series. */
const expectLink = (name: string, href: string, rel: 'prev' | 'next' | null) => {
  const control = screen.getByRole('link', { name })
  expect(control.tagName, name).toBe('A')
  expect(control.getAttribute('href'), name).toBe(href)
  expect(control.getAttribute('rel'), name).toBe(rel)
  expect(control.hasAttribute('aria-disabled'), name).toBe(false)
  expect(control.hasAttribute('data-disabled'), name).toBe(false)
}

describe('on the first page', () => {
  it('first and previous are spans, so no dead link is left to follow', () => {
    render(<Pagination value={1} pageCount={12} getHref={blog} />)
    expectEdge('First page')
    expectEdge('Previous')
  })

  it('next goes to page 2 and last to page 12', () => {
    render(<Pagination value={1} pageCount={12} getHref={blog} />)
    expectLink('Next', '/blog?page=2', 'next')
    expectLink('Last page', '/blog?page=12', null)
  })
})

describe('in the middle', () => {
  it('all four controls are links, one page either side and both ends', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expectLink('First page', '/blog?page=1', null)
    expectLink('Previous', '/blog?page=5', 'prev')
    expectLink('Next', '/blog?page=7', 'next')
    expectLink('Last page', '/blog?page=12', null)
  })

  it('has no disabled control at all', () => {
    const { container } = render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(container.querySelectorAll('[aria-disabled], [data-disabled]')).toHaveLength(0)
  })

  it('says rel on previous and next only: a page number is not a place in the series', () => {
    const { container } = render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect([...container.querySelectorAll('a[rel]')].map((a) => [a.getAttribute('aria-label'), a.getAttribute('rel')]))
      .toEqual([['Previous', 'prev'], ['Next', 'next']])
  })
})

describe('on the last page', () => {
  it('next and last are spans', () => {
    render(<Pagination value={12} pageCount={12} getHref={blog} />)
    expectEdge('Next')
    expectEdge('Last page')
  })

  it('previous goes to page 11 and first to page 1', () => {
    render(<Pagination value={12} pageCount={12} getHref={blog} />)
    expectLink('Previous', '/blog?page=11', 'prev')
    expectLink('First page', '/blog?page=1', null)
  })
})

describe('with one page', () => {
  it('all four controls are spans, and the page itself is the only link', () => {
    const { container } = render(<Pagination value={1} pageCount={1} getHref={blog} />)
    for (const name of ['First page', 'Previous', 'Next', 'Last page']) expectEdge(name)
    expect(container.querySelectorAll('a[href]')).toHaveLength(1)
    expect(container.querySelector('a[href]')?.getAttribute('aria-label')).toBe('Page 1 of 1')
  })
})

describe('a value outside 1 to pageCount is clamped before any link is built (R-5.7-7)', () => {
  it('reads 0 and -3 as page 1, so previous cannot point at page 0', () => {
    for (const value of [0, -3, Number.NaN]) {
      const { unmount } = render(<Pagination value={value} pageCount={12} getHref={blog} />)
      expectEdge('Previous')
      expectLink('Next', '/blog?page=2', 'next')
      expect(screen.getByRole('link', { name: 'Page 1 of 12' }).getAttribute('aria-current')).toBe('page')
      unmount()
    }
  })

  it('reads 99 as page 12, so next cannot point at page 100', () => {
    render(<Pagination value={99} pageCount={12} getHref={blog} />)
    expectEdge('Next')
    expectLink('Previous', '/blog?page=11', 'prev')
    expect(screen.getByRole('link', { name: 'Page 12 of 12' }).getAttribute('aria-current')).toBe('page')
  })

  it('reads a pageCount of 0 as one page', () => {
    render(<Pagination value={4} pageCount={0} getHref={blog} />)
    expect(screen.getByRole('link', { name: 'Page 1 of 1' }).getAttribute('href')).toBe('/blog?page=1')
    expectEdge('Next')
  })
})

describe('getHref', () => {
  it('is never asked for a page outside 1 to pageCount, at either edge', () => {
    for (const value of [1, 12, 0, 99]) {
      const getHref = vi.fn(blog)
      const { unmount } = render(<Pagination value={value} pageCount={12} getHref={getHref} />)
      const asked = getHref.mock.calls.map(([page]) => page)
      expect(asked.filter((page) => page < 1 || page > 12), String(value)).toEqual([])
      expect(asked.length, String(value)).toBeGreaterThan(0)
      unmount()
    }
  })

  it('is asked for whole pages only, whatever fraction the caller passed', () => {
    const getHref = vi.fn(blog)
    render(<Pagination value={6.7} pageCount={11.5} getHref={getHref} />)
    expect(getHref.mock.calls.map(([page]) => page)).toEqual([1, 5, 1, 5, 6, 7, 12, 7, 12])
  })
})

describe('the clamps reach the rendered row', () => {
  it('reads a siblingCount of 50 as 3 and a boundaryCount of 50 as 3: 15 cells', () => {
    const { container } = render(
      <Pagination value={250} pageCount={500} siblingCount={50} boundaryCount={50} getHref={blog} />,
    )
    expect([...container.querySelectorAll('li > a[aria-label^="Page"]')].map((a) => a.textContent))
      .toEqual(['1', '2', '3', '247', '248', '249', '250', '251', '252', '253', '498', '499', '500'])
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2)
  })

  it('falls back to one sibling and one boundary for an explicit undefined', () => {
    const { container } = render(
      <Pagination value={250} pageCount={500} siblingCount={undefined} boundaryCount={undefined} getHref={blog} />,
    )
    expect([...container.querySelectorAll('li > a[aria-label^="Page"]')].map((a) => a.textContent))
      .toEqual(['1', '249', '250', '251', '500'])
  })
})
