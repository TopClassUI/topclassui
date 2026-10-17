import { describe, expect, it } from 'vitest'

import sitemap from './sitemap.js'

describe('sitemap', () => {
  const entries = sitemap()

  it('lists every live page in both locales and nothing under /preview', () => {
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://topclassui.com/en',
      'https://topclassui.com/ar',
      'https://topclassui.com/en/docs/page-blocks',
      'https://topclassui.com/ar/docs/page-blocks',
    ])
  })

  it('pairs every URL with its other language and x-default', () => {
    expect(entries[3]?.alternates?.languages).toEqual({
      en: 'https://topclassui.com/en/docs/page-blocks',
      ar: 'https://topclassui.com/ar/docs/page-blocks',
      'x-default': 'https://topclassui.com/en/docs/page-blocks',
    })
  })
})
