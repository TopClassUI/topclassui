import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { label: 'Breadcrumb' },
]

const of = (items: BreadcrumbItem[]) => markup(<Breadcrumb items={items} />)
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

/** The raw text between the script tags, exactly as a crawler or an HTML parser receives it. */
const raw = (out: string) => /<script type="application\/ld\+json">(.*?)<\/script>/.exec(out)?.[1] ?? ''

/** What a JSON-LD reader ends up with. */
const parsed = (out: string) => JSON.parse(raw(out)) as {
  '@context': string
  '@type': string
  itemListElement: { '@type': string; position: number; name: string; item: string }[]
}

describe('the structured data', () => {
  it('is one script of type application/ld+json, inside the nav and after the list', () => {
    const out = of(TRAIL)
    expect(count(out, '<script')).toBe(1)
    expect(out).toMatch(/<\/ol><script type="application\/ld\+json">[^<]*<\/script><\/nav>$/)
  })

  it('is a schema.org BreadcrumbList', () => {
    const data = parsed(of(TRAIL))
    expect(data['@context']).toBe('https://schema.org')
    expect(data['@type']).toBe('BreadcrumbList')
  })

  it('lists the crumbs that have an href, written out value by value', () => {
    expect(parsed(of(TRAIL))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: '/docs' },
      ],
    })
  })

  it('leaves the current page out, because it has no href to point at', () => {
    expect(raw(of(TRAIL))).not.toContain('Breadcrumb"')
    expect(parsed(of(TRAIL)).itemListElement).toHaveLength(2)
  })

  it('includes the last crumb when the caller gives it an href', () => {
    const data = parsed(of([{ href: '/', label: 'Home' }, { href: '/shop', label: 'Shop' }]))
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: '/shop' },
    ])
  })

  it('numbers what it lists from 1 with no gap, even when a middle crumb has no href', () => {
    const data = parsed(of([
      { href: '/', label: 'Home' },
      { label: 'Settings' },
      { href: '/settings/profile', label: 'Profile' },
      { label: 'Avatar' },
    ]))
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Profile', item: '/settings/profile' },
    ])
  })

  it('emits no script at all when no crumb has an href, rather than an empty list', () => {
    const out = of([{ label: 'Home' }, { label: 'Docs' }])
    expect(out).not.toContain('<script')
    expect(out).not.toContain('ld+json')
    expect(out).toMatch(/<\/ol><\/nav>$/)
  })

  it('keeps an absolute URL exactly as given', () => {
    const data = parsed(of([{ href: 'https://example.com/docs?a=1&b=2', label: 'Docs' }, { label: 'Now' }]))
    expect(data.itemListElement[0]?.item).toBe('https://example.com/docs?a=1&b=2')
  })

  it('keeps the whole label, which the visible crumb is free to cut', () => {
    const long = 'x'.repeat(1000)
    const out = of([{ href: '/long', label: long }, { label: 'Now' }])
    expect(parsed(out).itemListElement[0]?.name).toBe('x'.repeat(1000))
    expect(out).toContain(`<span class="truncate min-w-0">${'x'.repeat(200)}</span>`)
  })
})

describe('a label cannot break out of the script', () => {
  const HOSTILE = '</script><script>alert(1)</script>'
  const out = of([{ href: '/x', label: HOSTILE }, { label: 'Now' }])

  it('leaves exactly one closing script tag in the page: its own', () => {
    expect(count(out, '</script>')).toBe(1)
    expect(count(out, '<script')).toBe(1)
    expect(out).toMatch(/<\/script><\/nav>$/)
  })

  it('writes no raw < inside the script, so the HTML parser sees only data', () => {
    expect(raw(out)).not.toContain('<')
    expect(raw(out)).toContain('"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"')
  })

  it('still reads back as the same label, because \\u003c is the same character in JSON', () => {
    expect(parsed(out).itemListElement[0]?.name).toBe('</script><script>alert(1)</script>')
  })

  it('escapes a < in the href too', () => {
    const data = of([{ href: '/search?q=</script>', label: 'Search' }, { label: 'Now' }])
    expect(count(data, '</script>')).toBe(1)
    expect(parsed(data).itemListElement[0]?.item).toBe('/search?q=</script>')
  })

  it('cannot open an HTML comment, which would hide the closing tag from the parser', () => {
    const comment = of([{ href: '/x', label: '<!-- <script>' }, { label: 'Now' }])
    expect(raw(comment)).not.toContain('<!--')
    expect(parsed(comment).itemListElement[0]?.name).toBe('<!-- <script>')
  })

  it('shows the same hostile label as plain escaped text in the crumb', () => {
    expect(out).toContain('>&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;</span></a>')
  })

  it('survives quotes, backslashes and line breaks, which JSON.stringify escapes itself', () => {
    const tricky = 'He said "hi" \\ and\nleft'
    const data = parsed(of([{ href: '/q', label: tricky }, { label: 'Now' }]))
    expect(data.itemListElement[0]?.name).toBe('He said "hi" \\ and\nleft')
  })
})
