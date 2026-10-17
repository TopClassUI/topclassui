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
const urls = (out: string) => (JSON.parse(raw(out)) as { itemListElement: { item: string }[] })
  .itemListElement.map((entry) => entry.item)

const RELATIVE = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
  + '{"@type":"ListItem","position":1,"name":"Home","item":"/"},'
  + '{"@type":"ListItem","position":2,"name":"Docs","item":"/docs"}]}'

describe('without baseUrl', () => {
  it('writes each href into the JSON-LD as given, character for character', () => {
    expect(raw(html())).toBe(RELATIVE)
  })
})

describe('with baseUrl="https://example.com"', () => {
  const out = html({ baseUrl: 'https://example.com' })

  it('lists absolute URLs in the JSON-LD, which is what a crawler is documented to read', () => {
    expect(raw(out)).toBe(
      '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
      + '{"@type":"ListItem","position":1,"name":"Home","item":"https://example.com/"},'
      + '{"@type":"ListItem","position":2,"name":"Docs","item":"https://example.com/docs"}]}',
    )
  })

  it('leaves the links as written, so a click stays inside the app', () => {
    expect(anchors(out).map((tag) => attr(tag, 'href'))).toEqual(['/', '/docs'])
  })

  it('is read by the JSON-LD only: the nav carries no such attribute', () => {
    expect(out.startsWith('<nav aria-label="Breadcrumb" class="text-sm"><ol ')).toBe(true)
    expect(out.toLowerCase()).not.toContain('baseurl')
  })

  it('resolves a relative href against a base that has a path of its own', () => {
    const items = [{ href: 'shoes', label: 'Shoes' }, { href: '/cart', label: 'Cart' }, { label: 'Now' }]
    const shop = markup(<Breadcrumb items={items} baseUrl="https://example.com/shop/" />)
    expect(urls(shop)).toEqual(['https://example.com/shop/shoes', 'https://example.com/cart'])
  })

  it('keeps an href that is already absolute on its own site', () => {
    const items = [{ href: 'https://other.example/docs?a=1&b=2', label: 'Docs' }, { label: 'Now' }]
    expect(urls(markup(<Breadcrumb items={items} baseUrl="https://example.com" />)))
      .toEqual(['https://other.example/docs?a=1&b=2'])
  })
})

describe('a baseUrl that is not a URL', () => {
  // A typo in an environment variable must not turn every page with a trail into a 500.
  for (const bad of ['', 'example.com', '/docs', 'not a url', 'https://']) {
    it(`"${bad}" never throws, and the hrefs are written as given`, () => {
      expect(() => html({ baseUrl: bad })).not.toThrow()
      expect(raw(html({ baseUrl: bad }))).toBe(RELATIVE)
    })
  }
})
