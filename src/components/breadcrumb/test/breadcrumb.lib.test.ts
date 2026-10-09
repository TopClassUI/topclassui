import { describe, expect, it } from 'vitest'

import { buildBreadcrumbList, resolveHref, serializeJsonLd } from '../lib.js'

describe('buildBreadcrumbList', () => {
  it('turns each linked crumb into a ListItem with its position, name and item', () => {
    expect(buildBreadcrumbList([{ href: '/', label: 'Home' }, { href: '/docs', label: 'Docs' }])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: '/docs' },
      ],
    })
  })

  it('skips a crumb without an href and closes the gap in the positions', () => {
    const list = buildBreadcrumbList([{ label: 'Start' }, { href: '/a', label: 'A' }, { label: 'Gap' }, { href: '/b', label: 'B' }])
    expect(list.itemListElement.map((entry) => entry.position)).toEqual([1, 2])
    expect(list.itemListElement.map((entry) => entry.name)).toEqual(['A', 'B'])
    expect(list.itemListElement.map((entry) => entry.item)).toEqual(['/a', '/b'])
  })

  it('counts an empty href as a link, since only a missing one means the current page', () => {
    expect(buildBreadcrumbList([{ href: '', label: 'Here' }]).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Here', item: '' },
    ])
  })

  it('returns an empty list for no items and for no links, which the component then omits', () => {
    expect(buildBreadcrumbList([]).itemListElement).toEqual([])
    expect(buildBreadcrumbList([{ label: 'Only' }]).itemListElement).toEqual([])
  })

  it('does not change the array it was given', () => {
    const items = [{ href: '/', label: 'Home' }, { label: 'Now' }]
    buildBreadcrumbList(items)
    expect(items).toEqual([{ href: '/', label: 'Home' }, { label: 'Now' }])
  })
})

describe('resolveHref', () => {
  it('returns the href untouched when there is no base', () => {
    expect(resolveHref('/docs', undefined)).toBe('/docs')
    expect(resolveHref('', undefined)).toBe('')
    expect(resolveHref('docs/../a b', undefined)).toBe('docs/../a b')
  })

  it('makes a root-relative href absolute against the origin of the base', () => {
    expect(resolveHref('/docs', 'https://example.com')).toBe('https://example.com/docs')
    expect(resolveHref('/', 'https://example.com')).toBe('https://example.com/')
    expect(resolveHref('/docs?page=2#top', 'https://example.com/shop/')).toBe('https://example.com/docs?page=2#top')
  })

  it('resolves a path-relative href against the path of the base', () => {
    expect(resolveHref('shoes', 'https://example.com/shop/')).toBe('https://example.com/shop/shoes')
    expect(resolveHref('', 'https://example.com/shop/')).toBe('https://example.com/shop/')
  })

  it('leaves an absolute href on its own origin', () => {
    expect(resolveHref('https://other.example/a', 'https://example.com')).toBe('https://other.example/a')
  })

  it('falls back to the href as written when the base does not parse, and never throws', () => {
    expect(resolveHref('/docs', '')).toBe('/docs')
    expect(resolveHref('/docs', 'example.com')).toBe('/docs')
    expect(resolveHref('/docs', '/relative')).toBe('/docs')
    expect(resolveHref('/docs', 'https://')).toBe('/docs')
  })

  it('passes a missing href through, base or no base', () => {
    expect(resolveHref(undefined, 'https://example.com')).toBeUndefined()
    expect(resolveHref(undefined, undefined)).toBeUndefined()
  })
})

describe('buildBreadcrumbList with a base', () => {
  it('writes every item absolute, and changes neither the names nor the positions', () => {
    const list = buildBreadcrumbList([{ href: '/', label: 'Home' }, { label: 'Gap' }, { href: '/docs', label: 'Docs' }], 'https://example.com')
    expect(list.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
      { '@type': 'ListItem', position: 2, name: 'Docs', item: 'https://example.com/docs' },
    ])
  })

  it('is the list it was without one when the base is not a URL', () => {
    expect(buildBreadcrumbList([{ href: '/docs', label: 'Docs' }], 'nonsense').itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Docs', item: '/docs' },
    ])
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
