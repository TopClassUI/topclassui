// The rsc project, where React resolves its react-server build and has no client hooks.
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

type AnyElement = ReactElement<Record<string, unknown>>

/** The element Pagination returns, read before React renders it. */
const element = (props: Partial<PaginationProps> = {}) =>
  Pagination({ value: 3, pageCount: 12, getHref: blog, ...props }) as AnyElement

/** Every element in the tree, in document order, without rendering any of them. */
const walk = (node: ReactNode, found: AnyElement[] = []): AnyElement[] => {
  if (Array.isArray(node)) for (const child of node) walk(child as ReactNode, found)
  else if (isValidElement(node)) {
    found.push(node as AnyElement)
    walk((node as AnyElement).props['children'] as ReactNode, found)
  }
  return found
}

/** A stand-in for next/link: a client component the server may only hand plain props. */
const Link: (props: { href: string; prefetch?: boolean }) => null = () => null

describe('<Pagination> in a Server Component tree', () => {
  it('is a plain function that returns a nav, with no hook and no context to read', () => {
    expect(element().type).toBe('nav')
  })

  it('names the nav and reports the size without a provider above it', () => {
    expect(element().props['aria-label']).toBe('Pagination')
    expect(element().props['data-size']).toBe('md')
  })

  it('takes direction-free labels as a prop, since a Server Component has no context (R-5.1-4)', () => {
    expect(element({ labels: ar, locale: 'ar' }).props['aria-label']).toBe('ترقيم الصفحات')
  })

  it('calls getHref while it renders on the server, so the function never crosses to the client', () => {
    const asked: number[] = []
    element({ getHref: (page) => { asked.push(page); return blog(page) } })
    expect(asked).toEqual([1, 2, 1, 2, 3, 4, 5, 12, 4, 12])
  })
})

describe('the link element in a Server Component tree', () => {
  const links = (props: Partial<PaginationProps> = {}) =>
    walk(element({ link: <Link href="" prefetch={false} />, ...props })).filter((found) => found.type === Link)

  it('renders every link through the element it was given, and no plain anchor beside it', () => {
    const tree = walk(element({ link: <Link href="" prefetch={false} /> }))
    expect(tree.filter((found) => found.type === Link)).toHaveLength(10)
    expect(tree.filter((found) => found.type === 'a')).toHaveLength(0)
  })

  it('replaces the href of the element with the address of each page', () => {
    expect(links().map((found) => found.props['href'])).toEqual([
      '/blog?page=1', '/blog?page=2', '/blog?page=1', '/blog?page=2', '/blog?page=3',
      '/blog?page=4', '/blog?page=5', '/blog?page=12', '/blog?page=4', '/blog?page=12',
    ])
  })

  it('keeps what the caller put on the element, such as prefetch', () => {
    expect(links().map((found) => found.props['prefetch'])).toEqual([
      false, false, false, false, false, false, false, false, false, false,
    ])
  })

  it('hands the element no function and no ref, which could not cross to a client component', () => {
    const unsendable = links().flatMap((found) => Object.entries(found.props)
      .filter(([, value]) => typeof value === 'function' || typeof value === 'symbol')
      .map(([key]) => key))
    expect(unsendable).toEqual([])
    expect(links().filter((found) => found.props['ref'] != null)).toEqual([])
  })

  it('leaves an edge control a span, since there is no page to link to', () => {
    const tree = walk(element({ value: 1, link: <Link href="" /> }))
    expect(tree.filter((found) => found.type === Link)).toHaveLength(8)
    expect(tree.filter((found) => found.type === 'span').map((found) => found.props['aria-label']))
      .toEqual(['First page', 'Previous'])
  })
})
