import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** The name a caller gave each element of one tag, in document order. */
const namesOf = (html: string, tag: string) =>
  [...html.matchAll(new RegExp(`<${tag} [^>]*aria-label="([^"]*)"`, 'g'))].map((m) => m[1])

/** Each column header: its classes, and the column its sort link names when it has one. */
const headsOf = (html: string) =>
  [...html.matchAll(/<th scope="col"[^>]*class="([^"]*)"[^>]*>(?:<a [^>]*href="\?sort=(\w+)&amp;dir=asc")?/g)]

describe('a row action is named by its row, or a list of links reads the same word once per row', () => {
  it('basic: each link says which invoice it opens, starting with the word it shows', async () => {
    const html = await render('basic')
    expect(namesOf(html, 'a')).toEqual(['View invoice INV-1042', 'View invoice INV-1043', 'View invoice INV-1044', 'View invoice INV-1045'])
    expect(html.split('>View</').length - 1).toBe(4)
  })

  it('sticky-first-column: each button says which region it exports', async () => {
    const html = await render('sticky-first-column')
    expect(namesOf(html, 'button').slice(0, 4)).toEqual(['Export Middle East', 'Export North Africa', 'Export Western Europe', 'Export North America'])
  })

  it('row-actions: 25 buttons, 25 names, each with the number of its order', async () => {
    const names = namesOf(await render('row-actions'), 'button')
    expect(names).toHaveLength(25)
    expect(new Set(names).size).toBe(25)
    expect([names[0], names[1], names[24]]).toEqual(['Refund order 1042', 'Refund order 1041', 'Refund order 1018'])
  })
})

describe('row-actions holds what e2e/table.spec walks with the Tab key', () => {
  it('is one page of 25 in a box narrower than its table, with the first column stuck', async () => {
    const html = await render('row-actions')
    expect(html).toMatch(/^<div class="max-w-sm"><div [^>]*role="region"[^>]*data-sticky-first-column=""/)
    expect(html.split('<th scope="row"').length - 1).toBe(25)
    expect(html.split('role="region"').length - 1).toBe(1)
  })

  it('has a link in every stuck cell, which is what pulled the box back on every row', async () => {
    const html = await render('row-actions')
    const stuck = [...html.matchAll(/<th scope="row" class="[^"]*sticky[^"]*"><a [^>]*href="#order-(\d+)"/g)].map((m) => m[1])
    expect(stuck).toHaveLength(25)
    expect([stuck[0], stuck[24]]).toEqual(['1042', '1018'])
  })

  it('has a sort link on the stuck column, on the one beside it and on an end-aligned one', async () => {
    const heads = headsOf(await render('row-actions'))
    expect(heads.map((m) => m[2])).toEqual(['number', 'customer', undefined, 'placed', 'total', undefined])
    expect(heads.map((m) => (m[1] ?? '').includes('sticky'))).toEqual([true, false, false, false, false, false])
    expect(heads.map((m) => (m[1] ?? '').includes('text-end'))).toEqual([false, false, false, false, true, true])
  })
})
