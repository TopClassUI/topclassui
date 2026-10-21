import { describe, expect, it } from 'vitest'

import { LIVE_PAGES, LOCALES, PAGES, pageBySlug } from '../content/pages.js'
import { pagedComponentOf, pagedComponents } from './components.js'
import { alternatesOf, createMetadata, fitDescription, ogImagePathOf, titleOf } from './metadata.js'

const subjects = [...LIVE_PAGES, ...pagedComponents()]
const button = pagedComponentOf('button')
const catalog = pageBySlug('components')

describe('createMetadata', () => {
  it('gives every page and every component page a title of its own in each locale', () => {
    for (const locale of LOCALES) {
      const titles = subjects.map((subject) => titleOf(subject, locale))
      expect(new Set(titles).size).toBe(titles.length)
    }
  })

  it('names Home, a guide page, the catalog and a component page as the plan writes them', () => {
    const [home, install] = PAGES
    expect(titleOf(home, 'en')).toBe('TopClass UI - React components for Next.js, RTL-first and server-first')
    expect(titleOf(install, 'en')).toBe('Install the package - TopClass UI')
    if (button === null || catalog === undefined) throw new Error('Button and the catalog have pages')
    expect(createMetadata(catalog, 'en').title).toEqual({ absolute: 'Components - TopClass UI' })
    expect(createMetadata(button, 'en').title).toEqual({ absolute: 'Button - TopClass UI' })
    expect(createMetadata(button, 'ar').title).toEqual({ absolute: 'زر - TopClass UI' })
    expect(createMetadata(pagedComponentOf('dropdown') ?? button, 'en').title).toEqual({ absolute: 'Dropdown menu - TopClass UI' })
  })

  it('writes a description of 120 to 160 characters on every page of both locales, with no backtick', () => {
    const wrong: string[] = []
    for (const subject of subjects) {
      for (const locale of LOCALES) {
        const meta = createMetadata(subject, locale)
        const text = typeof meta.description === 'string' ? meta.description : ''
        if (text.length < 120 || text.length > 160 || text.includes('`')) wrong.push(`${locale} ${titleOf(subject, locale)}: ${String(text.length)} ${text}`)
        expect(meta.openGraph?.description).toBe(text)
      }
    }
    expect(wrong).toEqual([])
  })

  it('names the X account as the Twitter card\'s site and creator on every page', () => {
    if (button === null) throw new Error('Button has a page')
    for (const subject of [PAGES[0], PAGES[1], button]) {
      for (const locale of LOCALES) {
        expect(createMetadata(subject, locale).twitter).toMatchObject({ card: 'summary_large_image', site: '@topclassui', creator: '@topclassui' })
      }
    }
  })

  it('points the canonical at the page itself and pairs both languages with x-default', () => {
    const install = PAGES[1]
    const meta = createMetadata(install, 'ar')
    expect(meta.alternates?.canonical).toBe('/ar/docs/installation')
    expect(alternatesOf(install)).toEqual({ en: '/en/docs/installation', ar: '/ar/docs/installation', 'x-default': '/en/docs/installation' })
    if (button === null) throw new Error('Button has a page')
    expect(createMetadata(button, 'en').alternates).toEqual({
      canonical: '/en/docs/components/button',
      languages: { en: '/en/docs/components/button', ar: '/ar/docs/components/button', 'x-default': '/en/docs/components/button' },
    })
  })

  it('gives every page its own card, with an alt text that names the page', () => {
    if (button === null) throw new Error('Button has a page')
    expect(createMetadata(button, 'ar').openGraph?.images).toEqual([
      { url: '/ar/docs/components/button/opengraph-image-5tbf0g', width: 1200, height: 630, alt: 'زر، على بطاقة TopClass UI', type: 'image/png' },
    ])
    expect(createMetadata(PAGES[1], 'en').twitter?.images).toEqual([
      { url: '/en/docs/installation/opengraph-image-ccc11p', width: 1200, height: 630, alt: 'Install the package, on the TopClass UI card', type: 'image/png' },
    ])
    expect(ogImagePathOf(PAGES[0], 'en')).toBe('/en/opengraph-image-1yhjss')
    expect(ogImagePathOf(pagedComponentOf('dropdown') ?? button, 'en')).toBe('/en/docs/components/dropdown/opengraph-image-cb0i9m')
    const alts = subjects.map((subject) => createMetadata(subject, 'en').openGraph?.images)
    expect(new Set(alts.map((images) => JSON.stringify(images))).size).toBe(subjects.length)
  })
})

describe('fitDescription', () => {
  const tails = [' Short tail.', ' A tail of thirty-one characters.']

  it('keeps a lead already inside the range, less its backticks', () => {
    const lead = `${'a'.repeat(128)} \`x\``
    expect(fitDescription(lead, tails)).toBe(`${'a'.repeat(128)} x`)
  })

  it('adds the longest tail that keeps a short lead inside the range', () => {
    expect(fitDescription('b'.repeat(100), tails)).toBe(`${'b'.repeat(100)} A tail of thirty-one characters.`)
    const long = ` ${'x'.repeat(49)}`
    expect(fitDescription('c'.repeat(115), [' Short tail.', long])).toBe(`${'c'.repeat(115)} Short tail.`)
    expect(fitDescription('c'.repeat(90), [' Short tail.', long])).toBe(`${'c'.repeat(90)}${long}`)
  })

  it('leaves a lead no tail can fit, so the length test names it', () => {
    expect(fitDescription('d'.repeat(40), tails)).toBe('d'.repeat(40))
  })
})
