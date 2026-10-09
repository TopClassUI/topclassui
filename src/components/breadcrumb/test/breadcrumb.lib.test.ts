import { describe, expect, it } from 'vitest'

import { buildBreadcrumbList, serializeJsonLd } from '../lib.js'

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
