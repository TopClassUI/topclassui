import { describe, expect, it } from 'vitest'

import { dynamicRoutes, missingRoutes, undatedUrls } from './lib/static-routes.js'

const manifests = {
  appRoutes: { '/(site)/[locale]/page': '/[locale]', '/icon/route': '/icon', '/api/x/route': '/api/x', '/[locale]/blog/[slug]': '/[locale]/blog/[slug]' },
  prerender: {
    routes: { '/en': {}, '/ar': {}, '/icon': {} },
    dynamicRoutes: { '/[locale]': { fallback: false }, '/[locale]/blog/[slug]': { fallback: null } },
  },
}

describe('dynamicRoutes', () => {
  it('flags a route never prerendered and an SSG segment that renders unknown params on request', () => {
    expect(dynamicRoutes(manifests)).toEqual(['/[locale]/blog/[slug]', '/api/x'])
  })
})

describe('missingRoutes', () => {
  it('names a required path the build did not write', () => {
    expect(missingRoutes(manifests, ['/en', '/sitemap.xml'])).toEqual(['/sitemap.xml'])
  })
})

describe('undatedUrls', () => {
  it('names a URL listed with no lastmod, and one not listed at all', () => {
    const xml = [
      '<urlset>',
      '<url>\n<loc>https://topclassui.com/en</loc>\n<lastmod>2026-10-19T16:47:22.000Z</lastmod>\n</url>',
      '<url>\n<loc>https://topclassui.com/ar</loc>\n<xhtml:link rel="alternate" hreflang="en" href="https://topclassui.com/en" />\n</url>',
      '</urlset>',
    ].join('\n')
    expect(undatedUrls(xml, ['https://topclassui.com/en', 'https://topclassui.com/ar', 'https://topclassui.com/en/docs/components'])).toEqual([
      'https://topclassui.com/ar',
      'https://topclassui.com/en/docs/components',
    ])
  })
})
