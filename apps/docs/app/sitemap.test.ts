import { describe, expect, it } from 'vitest'

import sitemap from './sitemap.js'

describe('sitemap', () => {
  const entries = sitemap()

  it('lists every live page in both locales and nothing under /preview', () => {
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://topclassui.com/en',
      'https://topclassui.com/ar',
      'https://topclassui.com/en/docs/installation',
      'https://topclassui.com/ar/docs/installation',
      'https://topclassui.com/en/docs/css',
      'https://topclassui.com/ar/docs/css',
      'https://topclassui.com/en/docs/provider',
      'https://topclassui.com/ar/docs/provider',
      'https://topclassui.com/en/docs/first-component',
      'https://topclassui.com/ar/docs/first-component',
    ])
  })

  it('pairs every URL with its other language and x-default', () => {
    expect(entries[3]?.alternates?.languages).toEqual({
      en: 'https://topclassui.com/en/docs/installation',
      ar: 'https://topclassui.com/ar/docs/installation',
      'x-default': 'https://topclassui.com/en/docs/installation',
    })
  })
})
