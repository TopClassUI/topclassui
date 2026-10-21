import { describe, expect, it } from 'vitest'

import sitemap from './sitemap.js'

describe('sitemap', () => {
  const entries = sitemap()

  it('lists every live page in both locales, then the 49 component pages, and nothing under /preview', () => {
    expect(entries).toHaveLength(126)
    expect(entries.map((entry) => entry.url).filter((url) => url.includes('/preview'))).toEqual([])
    expect(entries[28]?.url).toBe('https://topclassui.com/en/docs/components/accordion')
    expect(entries.slice(0, 28).map((entry) => entry.url)).toEqual([
      'https://topclassui.com/en',
      'https://topclassui.com/ar',
      'https://topclassui.com/en/docs/installation',
      'https://topclassui.com/ar/docs/installation',
      'https://topclassui.com/en/docs/cli',
      'https://topclassui.com/ar/docs/cli',
      'https://topclassui.com/en/docs/css',
      'https://topclassui.com/ar/docs/css',
      'https://topclassui.com/en/docs/provider',
      'https://topclassui.com/ar/docs/provider',
      'https://topclassui.com/en/docs/first-component',
      'https://topclassui.com/ar/docs/first-component',
      'https://topclassui.com/en/docs/colors',
      'https://topclassui.com/ar/docs/colors',
      'https://topclassui.com/en/docs/icons',
      'https://topclassui.com/ar/docs/icons',
      'https://topclassui.com/en/docs/theming',
      'https://topclassui.com/ar/docs/theming',
      'https://topclassui.com/en/docs/rtl',
      'https://topclassui.com/ar/docs/rtl',
      'https://topclassui.com/en/docs/server-first',
      'https://topclassui.com/ar/docs/server-first',
      'https://topclassui.com/en/docs/accessibility',
      'https://topclassui.com/ar/docs/accessibility',
      'https://topclassui.com/en/docs/components',
      'https://topclassui.com/ar/docs/components',
      'https://topclassui.com/en/changelog',
      'https://topclassui.com/ar/changelog',
    ])
  })

  it('dates Home and the catalog like every other page, from git, never the build clock', () => {
    for (const index of [0, 1, 22, 23]) {
      expect(entries[index]?.lastModified, entries[index]?.url).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/)
    }
    expect(entries.filter((entry) => entry.lastModified === undefined).map((entry) => entry.url)).toEqual([])
  })

  it('pairs every URL with its other language and x-default', () => {
    expect(entries[3]?.alternates?.languages).toEqual({
      en: 'https://topclassui.com/en/docs/installation',
      ar: 'https://topclassui.com/ar/docs/installation',
      'x-default': 'https://topclassui.com/en/docs/installation',
    })
  })
})
