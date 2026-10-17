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
    const [home, install] = PAGES
    expect(titleOf(home, 'en')).toBe('TopClass UI - React components for Next.js, RTL-first and server-first')
    expect(titleOf(install, 'en')).toBe('Install the package - TopClass UI')
  })

  it('points the canonical at the page itself and pairs both languages with x-default', () => {
    const install = PAGES[1]
    const meta = createMetadata(install, 'ar')
    expect(meta.alternates?.canonical).toBe('/ar/docs/installation')
    expect(alternatesOf(install)).toEqual({ en: '/en/docs/installation', ar: '/ar/docs/installation', 'x-default': '/en/docs/installation' })
  })
})
