import type { AnchorHTMLAttributes } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderLink } from './link.js'

const html = (el: React.ReactElement) => renderToStaticMarkup(el)

/** A stand-in for next/link: it renders the anchor and marks it, so a test sees who rendered it. */
function Link({ prefetch, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }) {
  return <a data-client-link="" data-prefetch={String(prefetch)} {...rest} />
}

const PARTS = { 'aria-label': 'Page 2', className: 'cell', children: '2' }

describe('with no link element', () => {
  it('renders a plain anchor: the href, then what the component wrote, in its order', () => {
    expect(html(renderLink('Pagination', undefined, '/orders?page=2', PARTS)))
      .toBe('<a href="/orders?page=2" aria-label="Page 2" class="cell">2</a>')
  })

  it('renders the same anchor for a bare one, and for the null a JavaScript caller may pass', () => {
    const none = null as unknown as undefined
    expect(html(renderLink('Pagination', <a />, '/orders?page=2', PARTS)))
      .toBe('<a href="/orders?page=2" aria-label="Page 2" class="cell">2</a>')
    expect(html(renderLink('Pagination', none, '/orders?page=2', PARTS)))
      .toBe('<a href="/orders?page=2" aria-label="Page 2" class="cell">2</a>')
  })

  it('leaves out an attribute the component set to undefined', () => {
    expect(html(renderLink('Pagination', undefined, '/a', { rel: undefined, 'aria-current': undefined, children: 'A' })))
      .toBe('<a href="/a">A</a>')
  })
})

describe('with a link element', () => {
  it('renders through that element, so a framework link navigates on the client', () => {
    expect(html(renderLink('Breadcrumb', <Link href="" />, '/docs', { className: 'crumb', children: 'Docs' })))
      .toBe('<a data-client-link="" data-prefetch="undefined" href="/docs" class="crumb">Docs</a>')
  })

  // renderElement lets the element's own props win, so an href merged late would be lost.
  it('replaces the href the element came with, a real placeholder included', () => {
    const out = html(renderLink('Breadcrumb', <Link href="/placeholder" />, '/docs', { children: 'Docs' }))
    expect(out).toBe('<a data-client-link="" data-prefetch="undefined" href="/docs">Docs</a>')
    expect(html(renderLink('Table', <a href="/placeholder" />, '?sort=name', { children: 'Name' })))
      .toBe('<a href="?sort=name">Name</a>')
  })

  it('keeps what the caller put on the element: a prop of its own and an attribute', () => {
    expect(html(renderLink('Table', <Link href="" prefetch={false} />, '/x', { children: 'X' })))
      .toContain('data-prefetch="false"')
    expect(html(renderLink('Table', <a rel="nofollow" />, '/x', { children: 'X' })))
      .toBe('<a rel="nofollow" href="/x">X</a>')
  })

  it('merges the class of the element last, so it wins a conflict with the component', () => {
    const out = html(renderLink('Table', <a className="text-body underline" />, '/x', { className: 'flex text-muted' }))
    expect(out).toBe('<a class="flex text-body underline" href="/x"></a>')
  })

  it('takes one element for many links without changing it', () => {
    const link = <Link href="" />
    const first = html(renderLink('Pagination', link, '/orders?page=1', { children: '1' }))
    const second = html(renderLink('Pagination', link, '/orders?page=2', { children: '2' }))
    expect(first).toContain('href="/orders?page=1"')
    expect(second).toContain('href="/orders?page=2"')
    expect((link.props as { href: string }).href).toBe('')
  })
})

describe('a link that is not an element', () => {
  const refuses = (link: unknown, component = 'Pagination') =>
    () => renderLink(component, link as undefined, '/x', {})

  it('is refused by the name of the prop and of the component it was passed to', () => {
    expect(refuses('a')).toThrow(TypeError)
    expect(refuses('a')).toThrow('Pagination: link must be an element, such as link={<Link href="" />}')
    expect(refuses('a', 'Table')).toThrow('Table: link must be an element, such as link={<Link href="" />}')
  })

  it('refuses the component passed whole, a number, false and a plain object, all in the same words', () => {
    for (const bad of [Link, 0, false, { href: '/x' }]) {
      expect(refuses(bad, 'Breadcrumb')).toThrow('Breadcrumb: link must be an element')
    }
  })

  it('never reaches React, whose own error blames a missing export', () => {
    expect(refuses(Link)).not.toThrow(/Element type is invalid|forgot to export/)
  })
})
