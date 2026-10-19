import { describe, expect, it } from 'vitest'

import { buildBreadcrumbList, resolveHref, resolveOrigin, serializeJsonLd } from '../lib.js'

const SITE = 'https://example.com'

describe('buildBreadcrumbList', () => {
  it('turns each linked crumb into a ListItem with its position, name and absolute item', () => {
    expect(buildBreadcrumbList([{ href: '/', label: 'Home' }, { href: '/docs', label: 'Docs' }], SITE)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: 'https://example.com/docs' },
      ],
    })
  })

  it('lists the current page last, with a name and no item', () => {
    expect(buildBreadcrumbList([{ href: '/', label: 'Home' }, { label: 'Now' }], SITE)?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
      { '@type': 'ListItem', position: 2, name: 'Now' },
    ])
  })

  it('skips a crumb without an href that is not the last, and closes the gap in the positions', () => {
    const list = buildBreadcrumbList([{ label: 'Start' }, { href: '/a', label: 'A' }, { label: 'Gap' }, { href: '/b', label: 'B' }, { label: 'Now' }], SITE)
    expect(list?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'A', item: 'https://example.com/a' },
      { '@type': 'ListItem', position: 2, name: 'B', item: 'https://example.com/b' },
      { '@type': 'ListItem', position: 3, name: 'Now' },
    ])
  })

  it('counts an empty href as a link, since only a missing one means the current page', () => {
    expect(buildBreadcrumbList([{ href: '', label: 'Here' }], SITE)?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Here', item: 'https://example.com/' },
    ])
  })

  it('is null without a siteUrl, whatever the trail', () => {
    expect(buildBreadcrumbList([{ href: '/', label: 'Home' }, { label: 'Now' }], undefined)).toBeNull()
    expect(buildBreadcrumbList([{ href: 'https://example.com/', label: 'Home' }], undefined)).toBeNull()
  })

  it('is null for no items and for no links, since a list with no URL in it points nowhere', () => {
    expect(buildBreadcrumbList([], SITE)).toBeNull()
    expect(buildBreadcrumbList([{ label: 'Only' }], SITE)).toBeNull()
    expect(buildBreadcrumbList([{ label: 'Home' }, { label: 'Now' }], SITE)).toBeNull()
  })

  it('is null when the siteUrl is not an http or https URL, even if every href is absolute', () => {
    for (const bad of ['', 'example.com', '/docs', 'not a url', 'https://', 'ftp://example.com', 'javascript:alert(1)']) {
      expect(buildBreadcrumbList([{ href: 'https://example.com/a', label: 'A' }], bad), bad).toBeNull()
    }
  })

  it('resolves against the origin alone, so a trailing slash or a path changes nothing', () => {
    const items = [{ href: 'shoes', label: 'Shoes' }, { href: '/cart', label: 'Cart' }]
    for (const site of ['https://example.com/', 'https://example.com/shop/', 'https://example.com/shop']) {
      expect(buildBreadcrumbList(items, site)?.itemListElement.map((entry) => entry.item), site)
        .toEqual(['https://example.com/shoes', 'https://example.com/cart'])
    }
  })

  it('does not change the array it was given', () => {
    const items = [{ href: '/', label: 'Home' }, { label: 'Now' }]
    buildBreadcrumbList(items, SITE)
    expect(items).toEqual([{ href: '/', label: 'Home' }, { label: 'Now' }])
  })
})

describe('resolveOrigin', () => {
  it('is the origin of an http or https URL', () => {
    expect(resolveOrigin('https://example.com')).toBe('https://example.com')
    expect(resolveOrigin('http://localhost:3000/')).toBe('http://localhost:3000')
    expect(resolveOrigin('https://example.com/shop/?a=1#top')).toBe('https://example.com')
  })

  it('is undefined for anything else, and never throws', () => {
    expect(resolveOrigin('')).toBeUndefined()
    expect(resolveOrigin('example.com')).toBeUndefined()
    expect(resolveOrigin('https://')).toBeUndefined()
    expect(resolveOrigin('mailto:a@example.com')).toBeUndefined()
  })
})

describe('resolveHref', () => {
  it('makes a root-relative or path-relative href absolute against the origin', () => {
    expect(resolveHref('/docs', SITE)).toBe('https://example.com/docs')
    expect(resolveHref('/', SITE)).toBe('https://example.com/')
    expect(resolveHref('docs?page=2#top', SITE)).toBe('https://example.com/docs?page=2#top')
  })

  it('leaves an absolute href on its own origin', () => {
    expect(resolveHref('https://other.example/a', SITE)).toBe('https://other.example/a')
  })

  it('falls back to the href as written when it does not parse, and never throws', () => {
    expect(resolveHref('https://', SITE)).toBe('https://')
    expect(resolveHref('http://[', SITE)).toBe('http://[')
  })
})

describe('serializeJsonLd', () => {
  it('is plain JSON when there is nothing to escape', () => {
    expect(serializeJsonLd({ a: 1, b: 'two' })).toBe('{"a":1,"b":"two"}')
  })

  it('escapes every <, not only the first', () => {
    expect(serializeJsonLd({ a: '<<', b: '<' })).toBe('{"a":"\\u003c\\u003c","b":"\\u003c"}')
  })

  it('escapes a < in a key as well as in a value', () => {
    expect(serializeJsonLd({ '<k>': 'v' })).toBe('{"\\u003ck>":"v"}')
  })

  it('writes the closing script tag as six characters of escape and the rest untouched', () => {
    expect(serializeJsonLd('</script>')).toBe('"\\u003c/script>"')
  })

  it('round-trips through JSON.parse to the value it was given', () => {
    const value = { name: '</script><!-- <b>&amp;"quoted"</b>', n: [1, '<'] }
    expect(JSON.parse(serializeJsonLd(value))).toEqual({ name: '</script><!-- <b>&amp;"quoted"</b>', n: [1, '<'] })
  })
})
