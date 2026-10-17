import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** The accessible name of every link in the nav, in tab order of the document. */
const linkNames = () => screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'))

describe('in a real tree', () => {
  it('is a navigation landmark named by the labels', () => {
    render(<Pagination value={3} pageCount={12} getHref={blog} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' }).tagName).toBe('NAV')
  })

  it('holds one list, and every cell is an item of it', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    const list = within(screen.getByRole('navigation')).getByRole('list')
    expect(list.tagName).toBe('UL')
    expect([...list.children].map((child) => child.tagName))
      .toEqual(['LI', 'LI', 'LI', 'LI', 'LI', 'LI', 'LI', 'LI', 'LI', 'LI', 'LI'])
  })

  it('announces nine items for page 6 of 12, because the two gaps are hidden', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
  })

  it('names the four controls and each page, in reading order', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(linkNames()).toEqual([
      'First page', 'Previous', 'Page 1', 'Page 5', 'Page 6 of 12', 'Page 7', 'Page 12', 'Next', 'Last page',
    ])
  })

  it('shows the number alone, which the accessible name contains (SC 2.5.3)', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(screen.getByRole('link', { name: 'Page 7' }).textContent).toBe('7')
    expect(screen.getByRole('link', { name: 'Page 6 of 12' }).textContent).toBe('6')
  })
})

describe('every page is a real link (PLAN 5.8)', () => {
  it('builds each href from getHref, so a crawler can follow all of them', () => {
    render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/blog?page=1', '/blog?page=5', '/blog?page=1', '/blog?page=5', '/blog?page=6',
      '/blog?page=7', '/blog?page=12', '/blog?page=7', '/blog?page=12',
    ])
  })

  it('renders anchors and nothing clickable that is not one', () => {
    const { container } = render(<Pagination value={6} pageCount={12} getHref={blog} />)
    expect(container.querySelectorAll('a[href]')).toHaveLength(9)
    expect(container.querySelectorAll('button, [onclick], [tabindex]')).toHaveLength(0)
  })

  it('marks the current page, and only that one, with aria-current', () => {
    const { container } = render(<Pagination value={6} pageCount={12} getHref={blog} />)
    const current = container.querySelectorAll('[aria-current]')
    expect(current).toHaveLength(1)
    expect(current[0]?.getAttribute('aria-current')).toBe('page')
    expect(current[0]?.getAttribute('href')).toBe('/blog?page=6')
  })

  it('follows a new value on re-render, because the value is the only state it has', () => {
    const { container, rerender } = render(<Pagination value={6} pageCount={12} getHref={blog} />)
    rerender(<Pagination value={7} pageCount={12} getHref={blog} />)
    expect(container.querySelector('[aria-current]')?.textContent).toBe('7')
    expect(screen.getByRole('link', { name: 'Next' }).getAttribute('href')).toBe('/blog?page=8')
  })
})

describe('the keyboard', () => {
  it('tabs through the nine links in order and stops nowhere else', async () => {
    render(<><Pagination value={6} pageCount={12} getHref={blog} /><button type="button">After</button></>)
    const visited: (string | null)[] = []
    for (let stop = 0; stop < 10; stop += 1) {
      await userEvent.tab()
      visited.push(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? null)
    }
    expect(visited).toEqual([
      'First page', 'Previous', 'Page 1', 'Page 5', 'Page 6 of 12', 'Page 7', 'Page 12', 'Next', 'Last page', 'After',
    ])
  })

  it('skips first and previous on page 1, because a span with no tabindex is no tab stop', async () => {
    render(<Pagination value={1} pageCount={12} getHref={blog} />)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Page 1 of 12' }))
  })
})

describe('the root element', () => {
  it('receives ref as a normal prop', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Pagination ref={ref} value={3} pageCount={12} getHref={blog} />)
    expect(ref.current).toBe(screen.getByRole('navigation'))
  })

  it('receives className, style, id and any other attribute', () => {
    render(
      <Pagination value={3} pageCount={12} getHref={blog} id="pages" className="mt-4" data-testid="pages" style={{ '--tc-density': '1' }} />,
    )
    const nav = screen.getByRole('navigation')
    expect(nav.id).toBe('pages')
    expect(nav.className).toBe('mt-4')
    expect(nav.getAttribute('data-testid')).toBe('pages')
    expect(nav.style.getPropertyValue('--tc-density')).toBe('1')
  })

  it('reports its size, and keeps reporting it when a caller passes another', () => {
    render(<Pagination value={3} pageCount={12} getHref={blog} {...{ 'data-size': 'xl' }} />)
    expect(screen.getByRole('navigation').getAttribute('data-size')).toBe('md')
  })
})
