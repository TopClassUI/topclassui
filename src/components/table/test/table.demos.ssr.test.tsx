import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'basic', 'caption', 'column-classes', 'empty', 'in-a-layout', 'rtl', 'skeleton', 'sorted', 'sticky-first-column',
  'striped',
]

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every table whole, from the opening tag of its scrolling box to the end of the table. */
const tables = (html: string) => [...html.matchAll(/<div [^>]*role="region"[^>]*><table .*?<\/table>/g)].map((m) => m[0])

const captionOf = (table: string) => /<caption id="([^"]*)"[^>]*>(.*?)<\/caption>/.exec(table)

/** What a stuck body cell ends its class list with, before its fill. */
const STUCK = 'sticky inset-s-0 z-(--tc-z-sticky) max-w-[var(--tc-table-sticky-width,8rem)] truncate'

describe('every demo renders on the server', () => {
  it('holds exactly these demos, so none can be deleted silently', () => {
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

    it(`${file}.tsx wraps no cell by hand to keep it on one line: the table does that`, async () => {
      expect(await render(file), file).not.toContain('<span class="whitespace-nowrap">')
    })
  }
})

describe('each demo shows what its name says', () => {
  it('basic: the caption read out and not drawn, the invoice as row header, amounts at the end, a Button link per row', async () => {
    const html = await render('basic')
    expect(html).toMatch(/<caption [^>]*class="sr-only">Invoices<\/caption>/)
    expect([...html.matchAll(/<th scope="row"[^>]*>(.*?)<\/th>/g)].map((m) => m[1])).toEqual(['INV-1042', 'INV-1043', 'INV-1044', 'INV-1045'])
    expect(html.split('text-end tabular-nums').length - 1).toBe(10)
    expect([...html.matchAll(/<a [^>]*href="\/invoices\/inv_\d+"/g)]).toHaveLength(4)
    // The header that used to widen the page: hidden words in the last column.
    expect(html).toContain('<span class="sr-only">Open</span></th>')
  })

  it('sorted: one ascending table and one descending, each with one sorted column and two sort links', async () => {
    const [byName, bySeats] = tables(await render('sorted'))
    expect([...(byName ?? '').matchAll(/aria-sort="(\w+)"/g)].map((m) => m[1])).toEqual(['ascending'])
    expect([...(bySeats ?? '').matchAll(/aria-sort="(\w+)"/g)].map((m) => m[1])).toEqual(['descending'])
    expect([...(byName ?? '').matchAll(/<a [^>]*href="\?sort=(\w+)&amp;dir=(\w+)"/g)].map((m) => `${m[1] ?? ''} ${m[2] ?? ''}`)).toEqual(['name desc', 'seats desc'])
    expect([...(bySeats ?? '').matchAll(/<a [^>]*href="\?sort=(\w+)&amp;dir=(\w+)"/g)].map((m) => `${m[1] ?? ''} ${m[2] ?? ''}`)).toEqual(['name asc', 'seats asc'])
  })

  it('striped: six rows, the second, fourth and sixth tinted', async () => {
    const html = await render('striped')
    const rows = [...html.slice(html.indexOf('<tbody>')).matchAll(/<tr(?: class="([^"]*)")?>/g)].map((m) => m[1])
    expect(rows).toEqual([undefined, 'bg-surface', undefined, 'bg-surface', undefined, 'bg-surface'])
  })

  it('sticky-first-column: a box narrower than its table, plain and striped, every first cell stuck with its fill', async () => {
    const html = await render('sticky-first-column')
    expect(html).toMatch(/^<div class="[^"]*max-w-sm[^"]*">/)
    const [plain, striped] = tables(html)
    for (const table of [plain ?? '', striped ?? '']) {
      expect(table.split(STUCK).length - 1).toBe(5)
      expect(table).toContain('data-sticky-first-column=""')
      expect(table).toContain('scroll-ps-[var(--tc-table-sticky-width,8rem)]')
    }
    expect(plain).not.toContain('data-striped')
    expect((striped ?? '').split(`${STUCK} bg-surface"`).length - 1).toBe(2)
    expect((striped ?? '').split(`${STUCK} bg-surface-raised"`).length - 1).toBe(2)
  })

  it('sticky-first-column: holds what e2e/table.spec scrolls under the stuck column, a dimmed Button and focusable controls', async () => {
    const [plain] = tables(await render('sticky-first-column'))
    expect([...(plain ?? '').matchAll(/<button [^>]*disabled=""/g)]).toHaveLength(2)
    expect([...(plain ?? '').matchAll(/<button (?![^>]*disabled="")[^>]*>/g)]).toHaveLength(2)
    expect([...(plain ?? '').matchAll(/<a [^>]*href="\?sort=q\d"/g)]).toHaveLength(4)
    expect([...(plain ?? '').matchAll(/<th scope="row"/g)]).toHaveLength(4)
  })

  it('empty: the built-in words in one table and the caller own fallback in the other', async () => {
    const [builtIn, custom] = tables(await render('empty'))
    expect(builtIn).toContain('colSpan="3"')
    expect(builtIn).toContain('>Nothing here yet</div></td>')
    expect(custom).toContain('Nobody has joined this team yet.')
    expect(custom).not.toContain('Nothing here yet')
  })

  it('caption: the caption is drawn', async () => {
    expect(await render('caption')).toMatch(/<caption id="[^"]*" class="[^"]*text-start[^"]*">API keys<\/caption>/)
  })

  it('column-classes: prose that wraps at its own width, a date hidden on a phone, and a column a flag leaves out', async () => {
    const html = await render('column-classes')
    expect([...html.matchAll(/<th scope="col"[^>]*>(.*?)<\/th>/g)].map((m) => m[1])).toEqual(['Ticket', 'Subject', 'Last note', 'Opened', 'Replies'])
    expect(html).not.toContain('Assignee')
    expect(html.split('min-w-64 whitespace-normal"').length - 1).toBe(4)
    expect(html.split('hidden sm:table-cell"').length - 1).toBe(4)
  })

  it('skeleton: the placeholder and the table it stands in for have the same rows and columns', async () => {
    const html = await render('skeleton')
    const placeholder = /^<div class="[^"]*"><div [^>]*aria-hidden="true"[^>]*>(.*?)<\/table><\/div>/.exec(html)?.[1] ?? ''
    const [real] = tables(html)
    const shape = (table: string) => [table.split('<tr').length - 1, table.split('<th').length - 1 - (table.split('<thead').length - 1), table.split('<td').length - 1]
    expect(shape(placeholder)).toEqual([5, 4, 16])
    expect(shape((real ?? '').replace(/<th scope="row"/g, '<td'))).toEqual([5, 4, 16])
  })

  it('rtl: Arabic inside dir="rtl", with the Arabic words for sorting and for nothing', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div dir="rtl" lang="ar"/)
    expect(html).toContain('<span class="sr-only">ترتيب حسب </span>')
    expect(html).toContain('aria-label="مرتب تنازليًا"')
    expect(html).toContain('aria-label="مرتب تصاعديًا"')
    expect(html).toContain('>لا يوجد شيء بعد</div></td>')
    expect(html).not.toMatch(/Sort by|sorted (a|de)scending|Nothing here yet/)
    expect(html).toContain(STUCK)
  })

  it('rtl: the narrow table sits in a plain wrapper inside a grid, with no min-w-0 to help it', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div dir="rtl" lang="ar" class="grid gap-6">/)
    expect(html).toContain('<div class="max-w-sm"><div role="region"')
    expect(html).not.toContain('min-w-0 max-w-sm')
  })

  it('in-a-layout: a table in a card of a grid and one in the growing column of a flex row, neither parent told to shrink', async () => {
    const html = await render('in-a-layout')
    // The two layouts e2e/table.spec opens at 390 px: without the grid on the box each widens the page.
    expect(html).toMatch(/<div class="grid gap-6 lg:grid-cols-3"><section class="[^"]*"><h2 [^>]*>Recent orders<\/h2><div role="region"/)
    expect(html).toMatch(/<div class="flex gap-6"><p [^>]*>[^<]*<\/p><div class="flex-1"><div role="region"/)
    expect(html).not.toMatch(/min-w-0|overflow-hidden/)
    const [inCard, beside] = tables(html)
    for (const table of [inCard ?? '', beside ?? '']) {
      expect(table.split('<th scope="col"').length - 1).toBe(6)
      expect(table).toMatch(/^<div [^>]*class="relative isolate grid grid-cols-1 overflow-x-auto /)
    }
  })
})
