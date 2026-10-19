import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { label: 'Breadcrumb' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={TRAIL} {...props} />)
const anchors = (out: string) => out.match(/<a [^>]*>/g) ?? []

/** The raw text between the script tags, exactly as a crawler receives it. */
const raw = (out: string) => /<script type="application\/ld\+json">(.*?)<\/script>/.exec(out)?.[1] ?? ''
const urls = (out: string) => (JSON.parse(raw(out)) as { itemListElement: { item?: string }[] })
  .itemListElement.map((entry) => entry.item)

const ABSOLUTE = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
  + '{"@type":"ListItem","position":1,"name":"Home","item":"https://example.com/"},'
  + '{"@type":"ListItem","position":2,"name":"Docs","item":"https://example.com/docs"},'
  + '{"@type":"ListItem","position":3,"name":"Breadcrumb"}]}'

describe('without siteUrl', () => {
  it('writes no script, so a demo or a preview never claims a trail for the page holding it', () => {
    expect(html()).not.toContain('<script')
    expect(html()).toMatch(/<\/ol><\/nav>$/)
  })

  it('writes none for absolute hrefs either', () => {
    const out = markup(<Breadcrumb items={[{ href: 'https://example.com/', label: 'Home' }, { label: 'Now' }]} />)
    expect(out).not.toContain('ld+json')
  })

  it('writes none when siteUrl is passed as undefined, as a wrapper forwarding an unset variable does', () => {
    expect(html({ siteUrl: undefined })).not.toContain('<script')
  })
})

describe('with siteUrl="https://example.com"', () => {
  const out = html({ siteUrl: 'https://example.com' })

  it('lists absolute URLs, then the current page with no item', () => {
    expect(raw(out)).toBe(ABSOLUTE)
  })

  it('leaves the links as written, so a click stays inside the app', () => {
    expect(anchors(out).map((tag) => attr(tag, 'href'))).toEqual(['/', '/docs'])
  })

  it('is read by the JSON-LD only: the nav carries no such attribute', () => {
    expect(out.startsWith('<nav aria-label="Breadcrumb" class="text-sm"><ol ')).toBe(true)
    expect(out.toLowerCase()).not.toContain('siteurl')
  })

  it('resolves a relative href against the origin', () => {
    const items = [{ href: 'shoes', label: 'Shoes' }, { href: '/cart', label: 'Cart' }, { label: 'Now' }]
    const shop = markup(<Breadcrumb items={items} siteUrl="https://example.com" />)
    expect(urls(shop)).toEqual(['https://example.com/shoes', 'https://example.com/cart', undefined])
  })

  it('keeps an href that is already absolute on its own site', () => {
    const items = [{ href: 'https://other.example/docs?a=1&b=2', label: 'Docs' }, { label: 'Now' }]
    expect(urls(markup(<Breadcrumb items={items} siteUrl="https://example.com" />)))
      .toEqual(['https://other.example/docs?a=1&b=2', undefined])
  })

  it('reads a trailing slash as the same origin', () => {
    expect(raw(html({ siteUrl: 'https://example.com/' }))).toBe(ABSOLUTE)
  })
})

describe('a siteUrl that is not a URL', () => {
  // A typo in an environment variable must not turn every page with a trail into a 500, nor write relative URLs.
  for (const bad of ['', 'example.com', '/docs', 'not a url', 'https://', 'ftp://example.com']) {
    it(`"${bad}" never throws, and writes no script`, () => {
      expect(() => html({ siteUrl: bad })).not.toThrow()
      expect(html({ siteUrl: bad })).not.toContain('<script')
    })
  }
})
