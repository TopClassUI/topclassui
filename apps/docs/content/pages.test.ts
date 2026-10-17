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

  it('routes Home and the four getting-started pages today', () => {
    expect(LIVE_PAGES.map((page) => page.slug)).toEqual(['home', 'installation', 'css', 'provider', 'first-component'])
    expect(LIVE_GUIDES.map((page) => page.slug)).toEqual(['installation', 'css', 'provider', 'first-component'])
  })

  it('derives next from the live order, skipping a later page, and stops after the last', () => {
    expect(nextPage('home')?.slug).toBe('installation')
    expect(nextPage('installation')?.slug).toBe('css')
    expect(nextPage('css')?.slug).toBe('provider')
    expect(nextPage('provider')?.slug).toBe('first-component')
    expect(nextPage('first-component')).toBeUndefined()
  })

  it('builds the route under the locale', () => {
    expect(hrefOf({ path: '/' }, 'ar')).toBe('/ar')
    expect(hrefOf({ path: '/docs/css' }, 'en')).toBe('/en/docs/css')
  })
})
