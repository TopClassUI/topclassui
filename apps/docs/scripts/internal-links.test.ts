import { describe, expect, it } from 'vitest'

import { brokenLinks, linksOf, originsOf, redirectTarget, sameOriginPath } from './lib/internal-links.js'

const ORIGINS = ['https://topclassui.com', 'http://topclassui.com', 'https://www.topclassui.com', 'http://www.topclassui.com']
const BUILT = new Set(['/en', '/en/docs/installation', '/en/docs/rtl', '/en/docs/components', '/en/docs/components/button', '/llms.txt'])
const isBuilt = (path: string) => BUILT.has(path)
// The three redirects of .next/routes-manifest.json, as the 16.3.8 build writes them.
const REDIRECTS = [
  { source: '/:path+/', destination: '/:path+', regex: '^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$' },
  { source: '/', destination: '/en', regex: '^(?!/_next)/(?:/)?$' },
  { source: '/:locale(en|ar)/docs', destination: '/:locale/docs/installation', regex: '^(?!/_next)(?:/(en|ar))/docs(?:/)?$' },
]
const check = (path: string, html: string) => brokenLinks([{ path, html }], ORIGINS, isBuilt, REDIRECTS)

describe('originsOf', () => {
  it('is the site, then https and http with and without www', () => {
    expect(originsOf('https://topclassui.com')).toEqual(ORIGINS)
  })
})

describe('linksOf', () => {
  it('reads href in both quote styles, a form action, formaction and the links of the RSC payload', () => {
    const html = [
      `<a href="/en?a=1&amp;b=2">x</a><link rel="alternate" href='https://topclassui.com/ar'>`,
      '<form role="search" action="?search"><button formAction="/send">s</button></form>',
      '<script>self.__next_f.push([1,"[\\"$\\",\\"a\\",null,{\\"href\\":\\"/shop\\",\\"children\\":\\"Shop\\"}],{\\"action\\":\\"/subscribe\\",\\"href\\":\\"$undefined\\"}"])</script>',
    ].join('')
    expect(linksOf(html)).toEqual(['/en?a=1&b=2', 'https://topclassui.com/ar', '?search', '/send', '/shop', '/subscribe'])
  })
})

describe('sameOriginPath', () => {
  it('keeps the path of a link to any origin of the site and drops the rest', () => {
    expect(sameOriginPath('/en/docs/components?tab=all#top', '/en', ORIGINS)).toBe('/en/docs/components')
    expect(sameOriginPath('?page=7', '/en/docs/components/pagination', ORIGINS)).toBe('/en/docs/components/pagination')
    expect(sameOriginPath('https://topclassui.com/en', '/ar', ORIGINS)).toBe('/en')
    expect(sameOriginPath('http://topclassui.com/shop', '/en', ORIGINS)).toBe('/shop')
    expect(sameOriginPath('https://www.topclassui.com/shop', '/en', ORIGINS)).toBe('/shop')
    expect(sameOriginPath('http://www.topclassui.com/shop', '/en', ORIGINS)).toBe('/shop')
    expect(sameOriginPath('#shop', '/en', ORIGINS)).toBeNull()
    expect(sameOriginPath('https://github.com/TopClassUI/topclassui', '/en', ORIGINS)).toBeNull()
    expect(sameOriginPath('mailto:hello@topclassui.com', '/en', ORIGINS)).toBeNull()
  })
})

describe('redirectTarget', () => {
  it('substitutes the params of the first redirect that matches', () => {
    expect(redirectTarget('/shop/', REDIRECTS)).toBe('/shop')
    expect(redirectTarget('/ar/docs', REDIRECTS)).toBe('/ar/docs/installation')
    expect(redirectTarget('/', REDIRECTS)).toBe('/en')
    expect(redirectTarget('/shop', REDIRECTS)).toBeNull()
  })
})

describe('brokenLinks', () => {
  it('passes a page whose every same-origin link is built, redirected to a built page, a file, a query on itself or a fragment', () => {
    const html = [
      '<a href="/en/docs/components/button">b</a><a href="/en/docs">r</a><a href="/">h</a><a href="/en/docs/rtl/">t</a>',
      '<a href="/llms.txt">l</a><a href="#billing">e</a><a href="?page=7">p</a><a href="https://x.com/topclassui">x</a>',
      '<a href="http://www.topclassui.com/en/docs/components">w</a><form action="?subscribed" method="post"></form>',
    ].join('')
    expect(check('/en/docs/components/button', html)).toEqual([])
  })

  it('names each link that reaches nothing, once per page, with the page that links it', () => {
    const pages = [
      { path: '/en/docs/components/breadcrumb', html: '<a href="/shop">a</a><a href="/shop">b</a><a href="/en">c</a>' },
      { path: '/ar/docs/rtl', html: '<a href="https://topclassui.com/blog?page=2">d</a>' },
    ]
    expect(brokenLinks(pages, ORIGINS, isBuilt, REDIRECTS)).toEqual([
      { href: '/shop', page: '/en/docs/components/breadcrumb' },
      { href: 'https://topclassui.com/blog?page=2', page: '/ar/docs/rtl' },
    ])
  })

  it('follows a trailing slash to the path without it, which must be built', () => {
    expect(check('/en', '<a href="/shop/">a</a><a href="/en/docs/componentz/">b</a><a href="/en/docs/rtl/">c</a>')).toEqual([
      { href: '/shop/', page: '/en' },
      { href: '/en/docs/componentz/', page: '/en' },
    ])
  })

  it('reads the links a closed overlay keeps in the RSC payload', () => {
    const html = '<button>Open</button><script>self.__next_f.push([1,"{\\"href\\":\\"/docs/billing\\",\\"children\\":\\"Read the guide\\"}"])</script>'
    expect(check('/en/docs/components/popover', html)).toEqual([{ href: '/docs/billing', page: '/en/docs/components/popover' }])
  })

  it('checks a form action and a formaction like an href', () => {
    expect(check('/en', '<form action="/subscribe" method="post"><button formaction="/contact">s</button></form>')).toEqual([
      { href: '/subscribe', page: '/en' },
      { href: '/contact', page: '/en' },
    ])
  })

  it('names a link whose path does not decode instead of throwing', () => {
    expect(check('/en/docs/components/card', '<a href="/reports/50%off">r</a>')).toEqual([{ href: '/reports/50%off', page: '/en/docs/components/card' }])
  })

  it('checks the path of a link to http, www and http www as the site itself', () => {
    const html = '<a href="http://topclassui.com/shop">a</a><a href="https://www.topclassui.com/plans">b</a><a href="http://www.topclassui.com/login">c</a><a href="http://www.topclassui.com/en">d</a>'
    expect(check('/en', html)).toEqual([
      { href: 'http://topclassui.com/shop', page: '/en' },
      { href: 'https://www.topclassui.com/plans', page: '/en' },
      { href: 'http://www.topclassui.com/login', page: '/en' },
    ])
  })
})
