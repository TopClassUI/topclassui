import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'custom-size', 'first-page', 'last-page', 'many-pages', 'middle', 'rtl', 'sizes', 'two-navs', 'wide-numbers',
]

const load = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  return loaded.default
}

/** The text of every page link, in order. */
const pages = (html: string) => [...html.matchAll(/>([^<>]+)<\/a>/g)].map((match) => match[1])

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of EXPECTED) {
    it(`${file}.tsx exports one default demo that renders a nav of real links`, async () => {
      const Demo = await load(file)
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      const html = markup(<Demo />)
      expect(html, file).toContain('<nav ')
      expect(html, file).toContain('<a href="/')
      expect(html, file).toContain('aria-current="page"')
    })
  }
})

describe('each demo shows the state its name promises', () => {
  const render = async (file: string) => {
    const Demo = await load(file)
    return Demo ? markup(<Demo />) : ''
  }

  it('first-page: page 1 is current, and first and previous are the two spans', async () => {
    const html = await render('first-page')
    expect(html).toContain('aria-label="Page 1 of 12" aria-current="page"')
    expect([...html.matchAll(/<span [^>]*aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual(['First page', 'Previous'])
  })

  it('middle: page 6 is current, between two gaps, and nothing is disabled', async () => {
    const html = await render('middle')
    expect(pages(html)).toEqual(['1', '5', '6', '7', '12'])
    expect(html.match(/<li aria-hidden="true"/g)).toHaveLength(2)
    expect(html).not.toContain('aria-disabled')
  })

  it('last-page: page 12 is current, and next and last are the two spans', async () => {
    const html = await render('last-page')
    expect(html).toContain('aria-label="Page 12 of 12" aria-current="page"')
    expect([...html.matchAll(/<span [^>]*aria-label="([^"]*)"/g)].map((m) => m[1])).toEqual(['Next', 'Last page'])
  })

  it('rtl: sets the direction and the language, and names everything in Arabic', async () => {
    const html = await render('rtl')
    expect(html.startsWith('<div dir="rtl" lang="ar">')).toBe(true)
    expect(html).toContain('<nav aria-label="ترقيم الصفحات"')
    expect(html).toContain('aria-label="صفحة 3 من 12"')
    expect(html).toContain('aria-label="التالي"')
  })

  it('sizes: one nav per size of the scale, each with a name of its own', async () => {
    const html = await render('sizes')
    expect([...html.matchAll(/<nav aria-label="([^"]*)" data-size="([^"]*)"/g)].map((m) => [m[1], m[2]])).toEqual([
      ['Extra small', 'xs'], ['Small', 'sm'], ['Medium', 'md'], ['Large', 'lg'], ['Extra large', 'xl'],
    ])
  })

  it('many-pages: 500 pages in eleven cells, between the four controls', async () => {
    const html = await render('many-pages')
    expect(pages(html)).toEqual(['1', '2', '248', '249', '250', '251', '252', '499', '500'])
    expect(html.match(/<li/g)).toHaveLength(15)
  })

  it('two-navs: the pager above and the one below each carry a name of their own', async () => {
    const html = await render('two-navs')
    expect([...html.matchAll(/<nav aria-label="([^"]*)"/g)].map((m) => m[1]))
      .toEqual(['Orders pages, top', 'Orders pages, bottom'])
  })

  it('wide-numbers: page 12,345 of 123,456 at the three smallest sizes, which e2e measures', async () => {
    const html = await render('wide-numbers')
    expect([...html.matchAll(/<nav aria-label="[^"]*" data-size="([^"]*)"/g)].map((m) => m[1])).toEqual(['xs', 'sm', 'md'])
    expect(pages(html)).toEqual([
      '1', '12,344', '12,345', '12,346', '123,456',
      '1', '12,344', '12,345', '12,346', '123,456',
      '1', '12,344', '12,345', '12,346', '123,456',
    ])
  })

  it('custom-size: the second nav opts out of the scale and still names itself', async () => {
    const html = await render('custom-size')
    expect([...html.matchAll(/<nav ([^>]*)>/g)].map((m) => m[1])).toEqual([
      'aria-label="The scale" data-size="md"',
      'class="text-xs" aria-label="Your own cells" data-size="custom"',
    ])
  })
})
