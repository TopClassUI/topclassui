import { describe, expect, it } from 'vitest'

import { LOCALES, PAGES } from '../content/pages.js'
import { alternatesOf, createMetadata, titleOf } from './metadata.js'

describe('createMetadata', () => {
  it('gives every page a title of its own in each locale', () => {
    for (const locale of LOCALES) {
      const titles = PAGES.map((page) => titleOf(page, locale))
      expect(new Set(titles).size).toBe(titles.length)
    }
  })

  it('names Home and a guide page as the plan writes them', () => {
    const [home, blocks] = PAGES
    expect(titleOf(home, 'en')).toBe('TopClass UI - React components for Next.js, RTL-first and server-first')
    expect(titleOf(blocks, 'en')).toBe('Page blocks - TopClass UI')
  })

  it('points the canonical at the page itself and pairs both languages with x-default', () => {
    const blocks = PAGES[1]
    const meta = createMetadata(blocks, 'ar')
    expect(meta.alternates?.canonical).toBe('/ar/docs/page-blocks')
    expect(alternatesOf(blocks)).toEqual({ en: '/en/docs/page-blocks', ar: '/ar/docs/page-blocks', 'x-default': '/en/docs/page-blocks' })
  })
})
