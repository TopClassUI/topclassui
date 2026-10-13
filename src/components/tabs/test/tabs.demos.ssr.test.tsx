import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'controlled', 'disabled', 'enclosed', 'long-label', 'many', 'rtl', 'server-content', 'sizes']

/** How many roots each demo holds, and its tabs and panels: every panel is rendered, one per root is shown. */
const COUNTS: Record<string, { roots: number, tabs: number, panels: number }> = {
  'basic': { roots: 1, tabs: 3, panels: 3 },
  'controlled': { roots: 1, tabs: 3, panels: 3 },
  'disabled': { roots: 2, tabs: 6, panels: 6 },
  'enclosed': { roots: 1, tabs: 3, panels: 3 },
  'long-label': { roots: 2, tabs: 4, panels: 4 },
  'many': { roots: 2, tabs: 16, panels: 16 },
  'rtl': { roots: 1, tabs: 3, panels: 3 },
  'server-content': { roots: 1, tabs: 2, panels: 2 },
  'sizes': { roots: 12, tabs: 24, panels: 24 },
}

/** A sentence each demo keeps in a panel that is not the one it opens on. */
const HIDDEN_TEXT: Record<string, string> = {
  'basic': 'Only an owner can rename or delete this project.',
  'controlled': 'Everyone can read a published post.',
  'disabled': 'Two props changed their default.',
  'enclosed': 'Three people edited this project today.',
  'long-label': 'Nobody has written a note yet.',
  'many': 'Everything under Changelog.',
  'rtl': 'لا يعيد تسمية المشروع أو يحذفه إلا مالكه.',
  'server-content': '<li>Yousef Nasser</li>',
  'sizes': 'Props of your own size.',
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

const tags = (html: string, role: string) => html.match(new RegExp(`<[a-z]+ [^>]*role="${role}"[^>]*>`, 'g')) ?? []

/** The opening tag of every TabsRoot: the one element that carries both Base UI's orientation and our look. */
const roots = (html: string) => html.match(/<div data-orientation="[^"]*"[^>]*data-variant="[^"]*"[^>]*>/g) ?? []

describe('every demo renders on the server', () => {
  it('holds exactly the demos the brief asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
    expect(Object.keys(COUNTS)).toEqual(EXPECTED)
    expect(Object.keys(HIDDEN_TEXT)).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
    })

    it(`${file}.tsx renders its roots, its tabs and every one of its panels`, async () => {
      const html = await render(file)
      expect({
        roots: roots(html).length,
        tabs: tags(html, 'tab').length,
        panels: tags(html, 'tabpanel').length,
      }, file).toEqual(COUNTS[file])
    })

    it(`${file}.tsx opens each root on one tab, so the server HTML shows one panel a root and hides the rest`, async () => {
      const html = await render(file)
      const shown = tags(html, 'tabpanel').filter((tag) => attr(tag, 'hidden') === undefined)
      expect(shown.length, file).toBe(COUNTS[file]?.roots)
      expect(tags(html, 'tab').filter((tag) => attr(tag, 'aria-selected') === 'true').length, file).toBe(COUNTS[file]?.roots)
    })

    it(`${file}.tsx has the text of a panel that is not open in its HTML`, async () => {
      expect(await render(file), file).toContain(HIDDEN_TEXT[file])
    })

    it(`${file}.tsx names every list of tabs`, async () => {
      const html = await render(file)
      const lists = tags(html, 'tablist')
      expect(lists.length, file).toBe(COUNTS[file]?.roots)
      for (const list of lists) expect(attr(list, 'aria-label')?.length, list).toBeGreaterThan(3)
    })

    it(`${file}.tsx uses no bare anchor`, async () => {
      expect((await render(file)).match(/<a[\s>]/g) ?? [], file).toEqual([])
    })
  }
})

describe('what the demos show', () => {
  it('basic is the line look and enclosed the enclosed one', async () => {
    expect(attr(await render('basic'), 'data-variant')).toBe('line')
    expect(attr(await render('enclosed'), 'data-variant')).toBe('enclosed')
  })

  it('sizes shows the six sizes of each look', async () => {
    const html = await render('sizes')
    expect(roots(html).map((tag) => `${attr(tag, 'data-variant') ?? ''} ${attr(tag, 'data-size') ?? ''}`)).toEqual([
      'line xs', 'line sm', 'line md', 'line lg', 'line xl', 'line custom',
      'enclosed xs', 'enclosed sm', 'enclosed md', 'enclosed lg', 'enclosed xl', 'enclosed custom',
    ])
  })

  it('disabled has one disabled tab in each look', async () => {
    const disabled = tags(await render('disabled'), 'tab').filter((tag) => attr(tag, 'data-disabled') === '')
    expect(disabled).toHaveLength(2)
    for (const tag of disabled) expect(attr(tag, 'aria-disabled')).toBe('true')
  })

  it('server-content opens on its form, and keeps the list of the other panel in the HTML, hidden', async () => {
    const html = await render('server-content')
    const [hidden, shown] = [html.slice(html.indexOf('hidden=""'), html.lastIndexOf('role="tabpanel"')), html.slice(html.lastIndexOf('role="tabpanel"'))]
    expect(hidden).toContain('<li>Amal Haddad</li>')
    expect(hidden).not.toContain('<input ')
    expect(shown).toContain('<input ')
    expect(shown).toContain('name="email"')
    expect(shown).not.toContain(' hidden=""')
  })

  it('every demo keeps one tab of each list in the tab order of the server HTML: the one it opens on', async () => {
    for (const file of files) {
      const html = await render(file)
      const stops = tags(html, 'tab').filter((tag) => attr(tag, 'tabindex') === '0')
      expect(stops.length, file).toBe(COUNTS[file]?.roots)
      for (const tag of stops) expect(attr(tag, 'aria-selected'), file).toBe('true')
    }
  })

  it('rtl is Arabic inside dir="rtl", as an app with an RTL layout would render it', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar">')
    expect(html).toContain('نظرة عامة')
  })

  it('long-label keeps the whole of its 82 characters: only a label over 100 is cut', async () => {
    const html = await render('long-label')
    expect(html).toContain('>Quarterly revenue, costs and forecast for every region the finance team reports on</span>')
  })
})
