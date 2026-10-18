import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { headingsOf } from '../scripts/lib/toc.js'
import { LIVE_GUIDES, LIVE_PAGES, LOCALES, hrefOf } from './pages.js'

const read = (locale: string, slug: string) => readFileSync(join(import.meta.dirname, locale, `${slug}.mdx`), 'utf8')

describe('the links inside the guide pages', () => {
  for (const locale of LOCALES) {
    for (const page of LIVE_GUIDES) {
      it(`${locale}/${page.slug}: every site link goes to a live page in the same language, and to a heading it has`, () => {
        const links = [...read(locale, page.slug).matchAll(/\]\((\/[^)\s]+)\)/g)].map((match) => match[1] ?? '')
        for (const link of links) {
          const [path = '', hash] = link.split('#')
          const target = LIVE_PAGES.find((entry) => hrefOf(entry, locale) === path)
          expect(target, link).toBeDefined()
          if (hash !== undefined && target !== undefined) expect(headingsOf(read(locale, target.slug)).map((h) => h.id), link).toContain(hash)
        }
      })
    }
  }

  it('finds the three cross-links the pages carry in each language, six in all', () => {
    const count = LOCALES.flatMap((locale) => LIVE_GUIDES.flatMap((page) => [...read(locale, page.slug).matchAll(/\]\((\/[^)\s]+)\)/g)]))
    expect(count).toHaveLength(6)
  })
})
