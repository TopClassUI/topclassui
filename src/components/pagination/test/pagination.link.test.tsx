import type { AnchorHTMLAttributes } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const orders = (page: number) => `/orders?page=${String(page)}`

const html = (props: Partial<PaginationProps> = {}) =>
  markup(<Pagination value={6} pageCount={12} getHref={orders} {...props} />)

/** A stand-in for next/link: it renders the anchor and marks it, so a test sees who rendered it. */
function Link({ prefetch, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }) {
  return <a data-client-link="" data-prefetch={String(prefetch)} {...rest} />
}

/** The opening tag of every anchor, in document order. */
const anchors = (html_: string) => html_.match(/<a [^>]*>/g) ?? []

const HREFS = [
  '/orders?page=1', '/orders?page=5', '/orders?page=1', '/orders?page=5', '/orders?page=6',
  '/orders?page=7', '/orders?page=12', '/orders?page=7', '/orders?page=12',
]

describe('with no link element', () => {
  it('renders nine plain anchors for page 6 of 12, which reload the page in Next.js', () => {
    expect(anchors(html())).toHaveLength(9)
    expect(html()).not.toContain('data-client-link')
    expect(anchors(html()).map((tag) => attr(tag, 'href'))).toEqual(HREFS)
  })

  it('renders the same markup when the element passed is a bare anchor', () => {
    expect(html({ link: <a /> })).toBe(html())
  })
})

describe('with link={<Link href="" />} (PLAN 5.8)', () => {
  const linked = html({ link: <Link href="" /> })

  it('renders every link through that element, so a page change is a client navigation', () => {
    expect(anchors(linked)).toHaveLength(9)
    expect(anchors(linked).filter((tag) => tag.includes('data-client-link=""'))).toHaveLength(9)
  })

  it('replaces the href the element came with by the address of each page', () => {
    expect(anchors(linked).map((tag) => attr(tag, 'href'))).toEqual(HREFS)
  })

  // renderElement lets the element's own props win, so an href merged late would be lost.
  it('replaces a real placeholder too, or nine links would lead to one address', () => {
    const placed = html({ link: <Link href="/orders" /> })
    expect(anchors(placed).map((tag) => attr(tag, 'href'))).toEqual(HREFS)
    expect(placed).not.toContain('href="/orders"')
  })

  it('still names every link, marks the current page and says prev and next', () => {
    expect(anchors(linked).map((tag) => attr(tag, 'aria-label'))).toEqual([
      'First page', 'Previous', 'Page 1', 'Page 5', 'Page 6 of 12', 'Page 7', 'Page 12', 'Next', 'Last page',
    ])
    expect(anchors(linked).map((tag) => attr(tag, 'aria-current') ?? '-')).toEqual(['-', '-', '-', '-', 'page', '-', '-', '-', '-'])
    expect(anchors(linked).map((tag) => attr(tag, 'rel') ?? '-')).toEqual(['-', 'prev', '-', '-', '-', '-', '-', 'next', '-'])
  })

  it('still shows the number in a page link and the caret in a control', () => {
    expect(linked).toContain('>7</a>')
    expect(linked.match(/<svg [^>]*>.*?<\/svg><\/a>/g)).toHaveLength(4)
  })

  it('gives every link the look of a cell, the floor and the ring included', () => {
    for (const tag of anchors(linked)) {
      const list = (attr(tag, 'class') ?? '').split(' ')
      expect(list).toContain('h-control-md')
      expect(list).toContain('min-h-[var(--tc-target-min,24px)]')
      expect(list).toContain('focus-visible:outline-ring')
    }
  })

  it('keeps what the caller put on the element: a prop of its own and a class', () => {
    const own = html({ link: <Link href="" prefetch={false} className="underline" /> })
    for (const tag of anchors(own)) {
      expect(attr(tag, 'data-prefetch')).toBe('false')
      expect((attr(tag, 'class') ?? '').split(' ')).toContain('underline')
    }
  })

  it('leaves an edge control a span, since there is no page to link to', () => {
    const first = html({ value: 1, link: <Link href="" /> })
    expect(anchors(first)).toHaveLength(8)
    expect(first.match(/<span role="link" aria-disabled="true"/g)).toHaveLength(2)
    expect(first.match(/<span [^>]*data-client-link/g)).toBeNull()
  })

  it('never writes the element onto the nav', () => {
    expect(linked.startsWith('<nav aria-label="Pagination" data-size="md">')).toBe(true)
  })
})

describe('a link that is not an element', () => {
  it('is refused by the name of the prop and of the component, before React fails on it', () => {
    const notAnElement = 'a' as unknown as PaginationProps['link']
    expect(() => html({ link: notAnElement })).toThrow(TypeError)
    expect(() => html({ link: notAnElement })).toThrow('Pagination: link must be an element, such as link={<Link href="" />}')
  })

  it('says the same for the component passed whole, which is the usual slip: link={Link}', () => {
    const component = Link as unknown as PaginationProps['link']
    expect(() => html({ link: component })).toThrow('Pagination: link must be an element')
  })
})
