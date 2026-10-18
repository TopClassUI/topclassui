import { describe, expect, it } from 'vitest'

import { LIVE_GUIDES, LIVE_PAGES, PAGES, hrefOf, nextPage } from './pages.js'

describe('the page registry', () => {
  it('holds each slug and each path once', () => {
    expect(new Set(PAGES.map((page) => page.slug)).size).toBe(PAGES.length)
    expect(new Set(PAGES.map((page) => page.path)).size).toBe(PAGES.length)
  })

  it('gives every page a lead of 50 to 160 characters in both languages', () => {
    for (const page of PAGES) {
      for (const text of [page.description.en, page.description.ar]) {
        expect(text.length, `${page.slug}: ${text}`).toBeGreaterThanOrEqual(50)
        expect(text.length, `${page.slug}: ${text}`).toBeLessThanOrEqual(160)
      }
    }
  })

  it('routes Home and the placeholder guide page today', () => {
    expect(LIVE_PAGES.map((page) => page.slug)).toEqual(['home', 'page-blocks'])
    expect(LIVE_GUIDES.map((page) => page.slug)).toEqual(['page-blocks'])
  })

  it('derives next from the live order and stops after the last', () => {
    expect(nextPage('home')?.slug).toBe('page-blocks')
    expect(nextPage('page-blocks')).toBeUndefined()
  })

  it('builds the route under the locale', () => {
    expect(hrefOf({ path: '/' }, 'ar')).toBe('/ar')
    expect(hrefOf({ path: '/docs/css' }, 'en')).toBe('/en/docs/css')
  })
})
