// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks } from '../index.js'

interface LinkProps { href: string, className?: string, children?: ReactNode, 'aria-current'?: 'page' }

/** Stands in for next/link, which is not a dependency: a component that requires href. */
function Link({ href, className, children, ...rest }: LinkProps) {
  return <a href={href} className={className} {...rest}>{children}</a>
}

type Rendered = ReactElement<Record<string, unknown>>

describe('<NavbarLink render> in a Server Component tree', () => {
  const item = NavbarLink({ render: <Link href="/docs" />, current: true, children: 'Docs' }) as Rendered
  const link = item.props['children'] as Rendered

  it('returns a list item holding the element it was given, so the framework link is what renders', () => {
    expect(item.type).toBe('li')
    expect(link.type).toBe(Link)
  })

  it('leaves the href the element was written with, and marks the page being read', () => {
    expect(link.props['href']).toBe('/docs')
    expect(link.props['aria-current']).toBe('page')
  })

  it('hands it nothing a Server Component cannot pass to a client one (R-5.1-3)', () => {
    const given = Object.entries(link.props).filter(([, value]) => value !== undefined)
    const kinds = given.map(([key, value]) => `${key}: ${Array.isArray(value) ? 'elements' : typeof value}`)
    expect(kinds.sort()).toEqual(['aria-current: string', 'children: elements', 'className: string', 'href: string'])
  })

  it('writes no aria-current key at all when the link is not the page being read', () => {
    const plain = (NavbarLink({ render: <Link href="/docs" />, children: 'Docs' }) as Rendered).props['children'] as Rendered
    expect(plain.props['aria-current']).toBeUndefined()
  })
})

describe('<NavbarBrand render> in a Server Component tree', () => {
  const brand = NavbarBrand({ render: <Link href="/" />, children: 'TopClass UI' }) as Rendered

  it('returns the element it was given with the classes of the brand', () => {
    expect(brand.type).toBe(Link)
    expect(brand.props['href']).toBe('/')
    expect(String(brand.props['className'])).toContain('font-semibold')
  })
})

describe('the parts that call no hook resolve with none', () => {
  it('NavbarLinks returns a nav named in English, holding a list', () => {
    const nav = NavbarLinks({ children: null }) as Rendered
    expect(nav.type).toBe('nav')
    expect(nav.props['aria-label']).toBe('Main')
    expect((nav.props['children'] as Rendered).type).toBe('ul')
  })

  it('NavbarActions returns a div', () => {
    expect((NavbarActions({ children: null }) as Rendered).type).toBe('div')
  })

  it('a NavbarLink with no render returns a plain anchor in its list item', () => {
    const item = NavbarLink({ href: '/docs', children: 'Docs' }) as Rendered
    expect((item.props['children'] as Rendered).type).toBe('a')
    expect((item.props['children'] as Rendered).props['href']).toBe('/docs')
  })
})
