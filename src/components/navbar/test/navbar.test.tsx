import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { NAVBAR_DEFAULTS, NAVBAR_OFFSET_VARIABLE } from '../constants.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The opening tag of the first element of that name, attributes and all. */
const tag = (html: string, name: string) => new RegExp(`<${name}( [^>]*)?>`).exec(html)?.[0] ?? ''

describe('NavbarRoot', () => {
  it('is a header that holds its children, then the one client part, which draws nothing', () => {
    const html = markup(<NavbarRoot><i>inside</i></NavbarRoot>)
    expect(html.startsWith('<header class="')).toBe(true)
    expect(html.endsWith('<i>inside</i><span hidden=""></span></header>')).toBe(true)
  })

  it('is sticky unless told otherwise', () => {
    expect(NAVBAR_DEFAULTS.sticky).toBe(true)
    expect(tag(markup(<NavbarRoot />), 'header')).toContain('sticky top-0 z-(--tc-z-sticky)')
  })

  it('with sticky={false} it does not stick and renders no client part at all', () => {
    const html = markup(<NavbarRoot sticky={false}><i>inside</i></NavbarRoot>)
    expect(html.endsWith('<i>inside</i></header>')).toBe(true)
    expect(html).not.toContain('<span')
    expect(tag(html, 'header')).not.toContain('sticky')
    expect(tag(html, 'header')).not.toContain('z-(--tc-z-sticky)')
  })

  it('passes id, data attributes, style and aria attributes to the header', () => {
    const html = markup(<NavbarRoot id="top" data-section="site" aria-label="Site" style={{ ['--tc-density' as string]: 0.8 }} />)
    expect(tag(html, 'header')).toContain(' id="top"')
    expect(tag(html, 'header')).toContain(' data-section="site"')
    expect(tag(html, 'header')).toContain(' aria-label="Site"')
    expect(tag(html, 'header')).toContain(' style="--tc-density:0.8"')
  })

  it('renders with nothing in it', () => {
    expect(markup(<NavbarRoot sticky={false} />)).toMatch(/^<header class="[^"]+"><\/header>$/)
  })

  it('names the variable the tokens file reads, and no other', () => {
    expect(NAVBAR_OFFSET_VARIABLE).toBe('--tc-sticky-top')
  })
})

describe('NavbarBrand', () => {
  it('is a plain anchor that takes its href, with its text in a span of its own', () => {
    const html = markup(<NavbarBrand href="/">TopClass UI</NavbarBrand>)
    expect(html).toMatch(/^<a class="[^"]+" href="\/"><span class="truncate min-w-0">TopClass UI<\/span><\/a>$/)
  })

  it('keeps an element it is given beside its text: a logo is not wrapped', () => {
    const html = markup(<NavbarBrand href="/"><svg data-logo="" />TopClass UI</NavbarBrand>)
    expect(html).toContain('<svg data-logo=""></svg><span class="truncate min-w-0">TopClass UI</span>')
  })

  it('cuts a name of 300 characters at 100: the bound is a guard rail, not a width', () => {
    const html = markup(<NavbarBrand href="/">{'W'.repeat(300)}</NavbarBrand>)
    expect(html).toContain(`>${'W'.repeat(100)}</span>`)
    expect(html).not.toContain('W'.repeat(101))
  })

  it('renders with no text at all, named by the caller', () => {
    expect(markup(<NavbarBrand href="/" aria-label="Home" />)).toMatch(/^<a class="[^"]+" href="\/" aria-label="Home"><\/a>$/)
  })
})

describe('NavbarLinks', () => {
  it('is a nav that holds one list, and the list holds the links', () => {
    const html = markup(<NavbarLinks><NavbarLink href="/docs">Docs</NavbarLink></NavbarLinks>)
    expect(html).toMatch(/^<nav aria-label="Main" class="[^"]+"><ul role="list" class="[^"]+"><li class="[^"]+"><a /)
    expect(html.endsWith('</a></li></ul></nav>')).toBe(true)
  })

  it('renders its list with no link in it', () => {
    expect(markup(<NavbarLinks />)).toMatch(/^<nav aria-label="Main" class="[^"]+"><ul role="list" class="[^"]+"><\/ul><\/nav>$/)
  })

  it('passes id and data attributes to the nav, not to the list', () => {
    const html = markup(<NavbarLinks id="main-links" data-area="top" />)
    expect(tag(html, 'nav')).toContain(' id="main-links"')
    expect(tag(html, 'nav')).toContain(' data-area="top"')
    expect(tag(html, 'ul')).not.toContain('main-links')
  })
})

describe('NavbarLink', () => {
  it('is a list item holding one anchor, with its text in a span of its own', () => {
    const html = markup(<NavbarLink href="/docs">Docs</NavbarLink>)
    expect(html).toMatch(/^<li class="[^"]+"><a class="[^"]+" href="\/docs"><span class="truncate min-w-0">Docs<\/span><\/a><\/li>$/)
  })

  it('is not the current page unless told so', () => {
    expect(NAVBAR_DEFAULTS.current).toBe(false)
    expect(markup(<NavbarLink href="/docs">Docs</NavbarLink>)).not.toContain('aria-current')
    expect(markup(<NavbarLink href="/docs" current={false}>Docs</NavbarLink>)).not.toContain('aria-current')
  })

  it('with current it says aria-current="page" on the link, not on the list item', () => {
    const html = markup(<NavbarLink href="/docs" current>Docs</NavbarLink>)
    expect(tag(html, 'a')).toContain(' aria-current="page"')
    expect(tag(html, 'li')).not.toContain('aria-current')
  })

  it('lets the caller say another kind of current', () => {
    expect(tag(markup(<NavbarLink href="/docs" current aria-current="location">Docs</NavbarLink>), 'a')).toContain(' aria-current="location"')
  })

  it('passes id, target, rel and data attributes to the link', () => {
    const html = markup(<NavbarLink href="https://example.com" id="out" target="_blank" rel="noreferrer" data-track="nav">Out</NavbarLink>)
    for (const attribute of [' href="https://example.com"', ' id="out"', ' target="_blank"', ' rel="noreferrer"', ' data-track="nav"']) {
      expect(tag(html, 'a')).toContain(attribute)
    }
    expect(tag(html, 'li')).toMatch(/^<li class="[^"]+">$/)
  })

  it('cuts a label of 300 characters at 100', () => {
    const html = markup(<NavbarLink href="/w">{'W'.repeat(300)}</NavbarLink>)
    expect(html).toContain(`>${'W'.repeat(100)}</span>`)
    expect(html).not.toContain('W'.repeat(101))
  })

  it('keeps elements where text is expected, and wraps only the text between them', () => {
    const html = markup(<NavbarLink href="/e"><strong>Bold</strong> and <em>italic</em></NavbarLink>)
    expect(html).toContain('<strong>Bold</strong><span class="truncate min-w-0"> and </span><em>italic</em>')
  })
})

describe('NavbarActions', () => {
  it('is a div that holds what it is given and nothing of its own', () => {
    expect(markup(<NavbarActions><button type="button">Go</button></NavbarActions>))
      .toMatch(/^<div class="[^"]+"><button type="button">Go<\/button><\/div>$/)
  })

  it('passes id and data attributes to the div', () => {
    expect(tag(markup(<NavbarActions id="acts" data-area="end" />), 'div')).toMatch(/ id="acts"/)
    expect(tag(markup(<NavbarActions id="acts" data-area="end" />), 'div')).toMatch(/ data-area="end"/)
  })
})

describe('the whole bar', () => {
  const html = markup(
    <NavbarRoot>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs" current>Docs</NavbarLink>
        <NavbarLink href="/components">Components</NavbarLink>
      </NavbarLinks>
      <NavbarActions><a href="/login">Sign in</a></NavbarActions>
    </NavbarRoot>,
  )

  it('is a header holding the brand, the nav and the actions in that order, then the client part', () => {
    const order = [...html.matchAll(/<(header|nav|ul|li|div|span hidden="")/g)].map((match) => match[1])
    expect(order).toEqual(['header', 'nav', 'ul', 'li', 'li', 'div', 'span hidden=""'])
    expect(html.indexOf('TopClass UI')).toBeLessThan(html.indexOf('<nav'))
  })

  it('every link is a real anchor with its href in the server HTML', () => {
    expect([...html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((match) => match[1])).toEqual(['/', '/docs', '/components', '/login'])
  })

  it('marks one link as the page being read', () => {
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a aria-current="page" class="[^"]+" href="\/docs">/)
  })

  it('writes no English of its own but the name of the nav', () => {
    const text = html.replace(/<[^>]+>/g, '|').split('|').filter(Boolean)
    expect(text).toEqual(['TopClass UI', 'Docs', 'Components', 'Sign in'])
    expect(html.match(/aria-label="[^"]*"/g)).toEqual(['aria-label="Main"'])
  })
})
