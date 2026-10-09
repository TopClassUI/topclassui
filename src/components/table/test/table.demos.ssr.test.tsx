import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'caption', 'empty', 'rtl', 'sorted', 'sticky-first-column', 'striped']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every table whole, from the opening tag of its scrolling box to the end of the table. */
const tables = (html: string) => [...html.matchAll(/<div [^>]*role="region"[^>]*><table .*?<\/table>/g)].map((m) => m[0])

const captionOf = (table: string) => /<caption id="([^"]*)"[^>]*>(.*?)<\/caption>/.exec(table)

describe('every demo renders on the server', () => {
  it('holds exactly the demos the task asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a table`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that.
      expect(tables(await render(file)).length, file).toBeGreaterThan(0)
    })

    it(`${file}.tsx names every scrolling box by the caption of its own table`, async () => {
      for (const table of tables(await render(file))) {
        const caption = captionOf(table)
        expect(caption?.[2] ?? '', file).toMatch(/\S/)
        expect(attr(table.slice(0, table.indexOf('>') + 1), 'aria-labelledby'), file).toBe(caption?.[1])
      }
    })

    it(`${file}.tsx gives every table its own name, or two regions on one page read the same (axe landmark-unique)`, async () => {
      const names = tables(await render(file)).map((table) => captionOf(table)?.[2])
      expect(new Set(names).size, file).toBe(names.length)
    })

    it(`${file}.tsx has no bare link: one is a sort header or a Button, which both clear the target size`, async () => {
      const anchors = [...(await render(file)).matchAll(/<a [^>]*>/g)].map((m) => m[0])
      const bare = anchors.filter((a) => !a.includes('min-h-[var(--tc-target-min,24px)]') || !a.includes('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'))
      expect(bare, file).toEqual([])
    })
  }
})

describe('each demo shows what its name says', () => {
  it('basic: the caption is read out and not drawn, the amounts end-aligned, and a Button link per row', async () => {
    const html = await render('basic')
    expect(html).toContain('<caption id="')
    expect(html).toMatch(/<caption [^>]*class="sr-only">Invoices<\/caption>/)
    expect(html.split('text-end').length - 1).toBe(10)
    expect([...html.matchAll(/<a [^>]*data-variant="outline"[^>]*>|<a [^>]*href="\/invoices\/inv_\d+"/g)]).toHaveLength(4)
  })

  it('sorted: one ascending table and one descending, each with one sorted column and two sort links', async () => {
    const [byName, bySeats] = tables(await render('sorted'))
    expect([...(byName ?? '').matchAll(/aria-sort="(\w+)"/g)].map((m) => m[1])).toEqual(['ascending'])
    expect([...(bySeats ?? '').matchAll(/aria-sort="(\w+)"/g)].map((m) => m[1])).toEqual(['descending'])
    expect((byName ?? '').split('<a href="?sort=').length - 1).toBe(2)
    expect((bySeats ?? '').split('<a href="?sort=').length - 1).toBe(2)
  })

  it('striped: six rows, the second, fourth and sixth tinted', async () => {
    const html = await render('striped')
    const rows = [...html.slice(html.indexOf('<tbody>')).matchAll(/<tr(?: class="([^"]*)")?>/g)].map((m) => m[1])
    expect(rows).toEqual([undefined, 'bg-surface', undefined, 'bg-surface', undefined, 'bg-surface'])
  })

  it('sticky-first-column: a box narrower than its table, plain and striped, every first cell stuck', async () => {
    const html = await render('sticky-first-column')
    expect(html).toMatch(/^<div class="[^"]*max-w-sm[^"]*">/)
    const [plain, striped] = tables(html)
    for (const table of [plain ?? '', striped ?? '']) {
      expect(table.split('sticky inset-s-0').length - 1).toBe(5)
      expect(table).toContain('data-sticky-first-column=""')
    }
    expect(plain).not.toContain('data-striped')
    expect((striped ?? '').split('sticky inset-s-0 bg-surface"').length - 1).toBe(2)
    expect((striped ?? '').split('sticky inset-s-0 bg-surface-raised"').length - 1).toBe(2)
  })

  it('empty: the built-in words in one table and the caller own fallback in the other', async () => {
    const [builtIn, custom] = tables(await render('empty'))
    expect(builtIn).toContain('colSpan="3"')
    expect(builtIn).toContain('>Nothing here yet</td>')
    expect(custom).toContain('Nobody has joined this team yet.')
    expect(custom).not.toContain('Nothing here yet')
  })

  it('caption: the caption is drawn', async () => {
    expect(await render('caption')).toMatch(/<caption id="[^"]*" class="[^"]*text-start[^"]*">API keys<\/caption>/)
  })

  it('rtl: Arabic inside dir="rtl", with the Arabic words for sorting and for nothing', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div dir="rtl" lang="ar"/)
    expect(html).toContain('<span class="sr-only">ترتيب حسب </span>')
    expect(html).toContain('aria-label="مرتب تنازليًا"')
    expect(html).toContain('aria-label="مرتب تصاعديًا"')
    expect(html).toContain('>لا يوجد شيء بعد</td>')
    expect(html).not.toMatch(/Sort by|sorted (a|de)scending|Nothing here yet/)
    expect(html).toContain('sticky inset-s-0')
  })
})
