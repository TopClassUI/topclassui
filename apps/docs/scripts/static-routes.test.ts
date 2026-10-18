import { describe, expect, it } from 'vitest'

import { dynamicRoutes, missingRoutes } from './lib/static-routes.js'

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
