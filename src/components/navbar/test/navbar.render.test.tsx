import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { NavbarBrand, NavbarLink } from '../index.js'

interface LinkProps { href: string, prefetch?: boolean, className?: string, children?: ReactNode, 'aria-current'?: 'page' }

/** Stands in for next/link, which is not a dependency: a component that requires href. */
function Link({ href, prefetch, className, children, ...rest }: LinkProps) {
  return <a href={href} data-prefetch={prefetch === false ? 'off' : 'on'} className={className} {...rest}>{children}</a>
}

// R-5.7-4: the element form, so a Server Component can pass a framework link.
describe('<NavbarLink render>', () => {
  it('renders the element it is given inside the list item, with its own href', () => {
    const html = markup(<NavbarLink render={<Link href="/docs" />}>Docs</NavbarLink>)
    expect(html).toMatch(/^<li class="[^"]+"><a href="\/docs" data-prefetch="on" class="[^"]+"><span dir="auto" class="truncate min-w-0">Docs<\/span><\/a><\/li>$/)
  })

  it('gives it the classes of a link, so it looks like the anchor it replaces', () => {
    const framework = classList(markup(<NavbarLink render={<Link href="/docs" />}>Docs</NavbarLink>).replace(/^<li[^>]*>/, ''))
    const plain = classList(markup(<NavbarLink href="/docs">Docs</NavbarLink>).replace(/^<li[^>]*>/, ''))
    expect(framework).toEqual(plain)
    expect(framework).toContain('text-muted')
  })

  it('hands it aria-current when the link is the page being read', () => {
    const html = markup(<NavbarLink render={<Link href="/docs" />} current>Docs</NavbarLink>)
    expect(html).toContain(' aria-current="page"')
  })

  it('keeps the props the element was written with: they win over the part\'s', () => {
    const html = markup(<NavbarLink href="/ignored" render={<Link href="/docs" prefetch={false} />}>Docs</NavbarLink>)
    expect(html).toContain(' href="/docs"')
    expect(html).toContain(' data-prefetch="off"')
    expect(html).not.toContain('/ignored')
  })

  it('merges className: the part, then the caller on the part, then the element, which wins', () => {
    const html = markup(<NavbarLink className="text-body" render={<Link href="/docs" className="text-primary-solid" />}>Docs</NavbarLink>)
    const classes = classList(html.replace(/^<li[^>]*>/, ''))
    expect(classes).toContain('text-primary-solid')
    expect(classes).not.toContain('text-body')
    expect(classes).not.toContain('text-muted')
  })

  it('an element written with children keeps them', () => {
    const html = markup(<NavbarLink render={<Link href="/docs">Written</Link>}>Docs</NavbarLink>)
    expect(html).toContain('>Written</a>')
    expect(html).not.toContain('Docs')
  })

  it('refuses a function, in words that name the prop', () => {
    const render = (() => <a href="/docs">Docs</a>) as unknown as React.ReactElement
    expect(() => markup(<NavbarLink render={render}>Docs</NavbarLink>)).toThrow('render must be an element')
  })

  it('refuses a fragment, which takes no attribute', () => {
    expect(() => markup(<NavbarLink render={<></>}>Docs</NavbarLink>)).toThrow('not a fragment')
  })
})

describe('<NavbarBrand render>', () => {
  it('renders the element it is given, with its own href and the classes of the brand', () => {
    const html = markup(<NavbarBrand render={<Link href="/" />}>TopClass UI</NavbarBrand>)
    expect(html).toMatch(/^<a href="\/" data-prefetch="on" class="[^"]+"><span dir="auto" class="truncate min-w-0">TopClass UI<\/span><\/a>$/)
    expect(classList(html)).toEqual(classList(markup(<NavbarBrand href="/">TopClass UI</NavbarBrand>)))
    expect(classList(html)).toContain('font-semibold')
  })

  it('passes the rest of its props to that element', () => {
    const html = markup(<NavbarBrand id="brand" data-track="home" render={<Link href="/" />}>TopClass UI</NavbarBrand>)
    expect(attr(html, 'id')).toBe('brand')
    expect(attr(html, 'data-track')).toBe('home')
  })

  it('refuses a function', () => {
    const render = (() => <a href="/">Home</a>) as unknown as React.ReactElement
    expect(() => markup(<NavbarBrand render={render}>Home</NavbarBrand>)).toThrow('render must be an element')
  })
})
