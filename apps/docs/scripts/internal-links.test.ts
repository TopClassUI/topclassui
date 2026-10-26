import { describe, expect, it } from 'vitest'

import { brokenLinks, hrefsOf, sameOriginPath } from './lib/internal-links.js'

const ORIGIN = 'https://topclassui.com'
const BUILT = new Set(['/en', '/en/docs/components', '/en/docs/components/button', '/llms.txt'])
const resolves = (path: string) => BUILT.has(path) || /^\/(en|ar)\/docs$/.test(path)

describe('hrefsOf', () => {
  it('reads both quote styles and decodes entities', () => {
    expect(hrefsOf(`<a href="/en?a=1&amp;b=2">x</a><link rel="alternate" href='https://topclassui.com/ar'>`)).toEqual(['/en?a=1&b=2', 'https://topclassui.com/ar'])
  })
})

describe('sameOriginPath', () => {
  it('keeps the path of a same-origin href and drops the rest', () => {
    expect(sameOriginPath('/en/docs/components?tab=all#top', '/en', ORIGIN)).toBe('/en/docs/components')
    expect(sameOriginPath('https://topclassui.com/en', '/ar', ORIGIN)).toBe('/en')
    expect(sameOriginPath('button', '/en/docs/components/', ORIGIN)).toBe('/en/docs/components/button')
    expect(sameOriginPath('#shop', '/en', ORIGIN)).toBeNull()
    expect(sameOriginPath('https://github.com/TopClassUI/topclassui', '/en', ORIGIN)).toBeNull()
    expect(sameOriginPath('mailto:hello@topclassui.com', '/en', ORIGIN)).toBeNull()
  })
})

describe('brokenLinks', () => {
  it('passes a page whose every same-origin href is built, redirected, a file or a fragment', () => {
    const html = '<a href="/en/docs/components/button">b</a><a href="/en/docs">r</a><a href="/llms.txt">l</a><a href="#">e</a><a href="https://x.com/topclassui">x</a>'
    expect(brokenLinks([{ path: '/en', html }], ORIGIN, resolves)).toEqual([])
  })

  it('names each href that resolves to nothing, once per page, with the page that links it', () => {
    const pages = [
      { path: '/en/docs/components/breadcrumb', html: '<a href="/shop">a</a><a href="/shop">b</a><a href="/en">c</a>' },
      { path: '/ar/docs/rtl', html: '<a href="https://topclassui.com/blog?page=2">d</a>' },
    ]
    expect(brokenLinks(pages, ORIGIN, resolves)).toEqual([
      { href: '/shop', page: '/en/docs/components/breadcrumb' },
      { href: 'https://topclassui.com/blog?page=2', page: '/ar/docs/rtl' },
    ])
  })
})
