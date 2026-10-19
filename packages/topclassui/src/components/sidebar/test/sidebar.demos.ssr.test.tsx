import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'collapsed', 'controlled', 'groups', 'in-a-layout', 'long-list', 'playground', 'rtl', 'states']

/** What each demo holds: its rails, its links, its lists that have a name, the rows that are the current page, and its title. */
const SHOWS: Record<string, { rails: number, links: number, named: number, current: string[], title: string }> = {
  'basic': { rails: 1, links: 4, named: 0, current: ['Home'], title: 'Workspace' },
  'collapsed': { rails: 1, links: 4, named: 0, current: ['Home'], title: 'Workspace' },
  'controlled': { rails: 1, links: 2, named: 0, current: ['Home'], title: 'Workspace' },
  'groups': { rails: 1, links: 6, named: 2, current: ['Projects'], title: 'Acme' },
  'in-a-layout': { rails: 1, links: 4, named: 0, current: ['Orders'], title: 'Workspace' },
  'long-list': { rails: 1, links: 60, named: 1, current: ['Page 1'], title: 'Handbook' },
  // The Try it rail, with nothing passed: no row is current until the reader turns current on.
  'playground': { rails: 1, links: 3, named: 0, current: [], title: 'Workspace' },
  'rtl': { rails: 1, links: 4, named: 1, current: ['الرئيسية'], title: 'مساحة العمل' },
  'states': { rails: 2, links: 6, named: 0, current: ['Home', 'Projects'], title: 'Workspace' },
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

const tags = (html: string, name: string) => html.match(new RegExp(`<${name}[ >][^>]*>|<${name}>`, 'g')) ?? []
const text = (html: string) => html.replace(/<[^>]+>/g, '')

/** Each row as the server writes it: its opening tag, and the text of its label. */
const rows = (html: string) => [...html.matchAll(/<li>(<a [^>]*>)(.*?)<\/a><\/li>/g)].map((match) => ({ tag: match[1] ?? '', label: text(match[2] ?? '') }))

describe('every demo renders on the server', () => {
  it('holds exactly the demos the brief asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
    expect(Object.keys(SHOWS)).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
    })

    it(`${file}.tsx renders its rails, a toggle each, its title and every one of its links, each a link inside a list item`, async () => {
      const html = await render(file)
      expect(tags(html, 'nav'), file).toHaveLength(SHOWS[file]?.rails ?? -1)
      expect(html.match(/<button [^>]*aria-expanded="(true|false)"/g), file).toHaveLength(SHOWS[file]?.rails ?? -1)
      expect(rows(html).length, file).toBe(SHOWS[file]?.links)
      // No anchor outside a row: a link beside the rail in a demo would be a Button.
      expect(tags(html, 'a').length, file).toBe(SHOWS[file]?.links)
      expect(html, file).toContain(`>${SHOWS[file]?.title ?? ''}</span>`)
    })

    it(`${file}.tsx gives every link somewhere to go, an icon and a label`, async () => {
      for (const row of rows(await render(file))) {
        expect(attr(row.tag, 'href'), row.label).toMatch(/^#[a-z0-9-]+$/)
        expect(row.label.length, row.tag).toBeGreaterThan(1)
      }
      expect((await render(file)).match(/<a [^>]*><span class="[^"]*"><svg /g)?.length, file).toBe(SHOWS[file]?.links)
    })

    it(`${file}.tsx marks one row a rail at most as the page being read`, async () => {
      const current = rows(await render(file)).filter((row) => attr(row.tag, 'aria-current') === 'page')
      expect(current.map((row) => row.label), file).toEqual(SHOWS[file]?.current)
    })

    it(`${file}.tsx names each list that has a label, by an id that exists`, async () => {
      const html = await render(file)
      const named = tags(html, 'ul').map((list) => attr(list, 'aria-labelledby')).filter((id) => id !== undefined)
      expect(named.length, file).toBe(SHOWS[file]?.named)
      for (const id of named) expect(html, file).toContain(`<p id="${id}"`)
      for (const list of tags(html, 'ul')) expect(attr(list, 'role'), file).toBe('list')
    })

    it(`${file}.tsx writes no tabindex in its rail: a row is a link and the body needs no stop of its own`, async () => {
      const html = await render(file)
      const rail = html.slice(html.indexOf('<nav '), html.indexOf('</nav>'))
      expect(rail.length, file).toBeGreaterThan(500)
      expect(rail, file).not.toContain('tabindex')
    })
  }
})

describe('what the demos show', () => {
  it('every rail is expanded in the HTML the server sends but the collapsed ones, which are collapsed there too', async () => {
    const found: Record<string, string[]> = {}
    for (const file of files) {
      found[file] = tags(await render(file), 'nav').map((nav) => (attr(nav, 'data-closed') === '' ? 'closed' : attr(nav, 'data-open') === '' ? 'open' : '?'))
    }
    expect(found).toEqual({
      'basic': ['open'], 'collapsed': ['closed'], 'controlled': ['open'], 'groups': ['open'], 'in-a-layout': ['open'],
      'long-list': ['open'], 'playground': ['open'], 'rtl': ['open'], 'states': ['open', 'closed'],
    })
  })

  it('each rail sits in a parent that gives it a height, or its body could not scroll', async () => {
    const parents: Record<string, string> = {}
    for (const file of files) parents[file] = /class="([^"]*)"[^>]*><nav /.exec(await render(file))?.[1] ?? ''
    expect(parents).toEqual({
      'basic': 'h-96', 'collapsed': 'h-96', 'controlled': 'flex h-96 flex-wrap gap-4', 'groups': 'h-112',
      'in-a-layout': 'flex h-[calc(100dvh-4rem)]', 'long-list': 'h-[calc(100dvh-4rem)]', 'playground': 'h-96', 'rtl': 'h-96',
      'states': 'flex h-96 flex-wrap gap-6',
    })
  })

  it('groups names its two lists Workspace and Account', async () => {
    const html = await render('groups')
    expect([...html.matchAll(/<p id="[^"]+" dir="auto" class="[^"]*">([^<]*)<\/p>/g)].map((match) => match[1])).toEqual(['Workspace', 'Account'])
  })

  it('long-list holds sixty links in one list, the first of them current', async () => {
    const all = rows(await render('long-list'))
    expect(all.map((row) => row.label).slice(0, 2)).toEqual(['Page 1', 'Page 2'])
    expect(all.at(-1)?.label).toBe('Page 60')
    expect(attr(all.at(-1)?.tag ?? '', 'href')).toBe('#page-60')
  })

  it('controlled puts a column of at least 160 px beside the rail, which wraps under it where the row has no room', async () => {
    const html = await render('controlled')
    expect(html).toContain('</nav><div class="grid min-w-0 grow basis-40 content-start gap-3">')
  })

  it('in-a-layout puts a column that can shrink beside the rail, scrolling under the thin bar, holding a table', async () => {
    const html = await render('in-a-layout')
    expect(html).toContain('</nav><div class="min-w-0 flex-1 p-4 overflow-y-auto overscroll-contain scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))] [scrollbar-width:thin] [scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]">')
    expect(tags(html, 'table')).toHaveLength(1)
    // One main a page: the harness owns it, so the column is a div.
    expect(tags(html, 'main')).toHaveLength(0)
  })

  it('controlled holds a button of the page beside the rail, which a Server Component could not wire', async () => {
    const html = await render('controlled')
    expect(html).toContain('Hide the labels')
    expect(html).toContain('The rail asked to change 0 times.')
  })

  it('rtl is Arabic inside dir="rtl", with the rail and its toggle named in Arabic by the provider', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar" class="h-96">')
    expect(attr(tags(html, 'nav')[0] ?? '', 'aria-label')).toBe('الشريط الجانبي')
    expect(attr(tags(html, 'button')[0] ?? '', 'aria-label')).toBe('طي الشريط الجانبي')
    expect(rows(html).map((row) => row.label)).toEqual(['الرئيسية', 'المشاريع', 'الفريق', 'الإعدادات'])
  })

  it('states names each of its two rails, so a page can hold both, and each toggle in English', async () => {
    const html = await render('states')
    expect(tags(html, 'nav').map((nav) => attr(nav, 'aria-label'))).toEqual(['Expanded', 'Collapsed'])
    expect(tags(html, 'button').map((button) => attr(button, 'aria-label'))).toEqual(['Collapse the sidebar', 'Expand the sidebar'])
  })

  it('every other demo names its rail and its toggle in English', async () => {
    for (const file of files.filter((name) => name !== 'rtl' && name !== 'states')) {
      const html = await render(file)
      expect(attr(tags(html, 'nav')[0] ?? '', 'aria-label'), file).toBe('Sidebar')
      expect(attr(tags(html, 'button')[0] ?? '', 'aria-label'), file).toBe(file === 'collapsed' ? 'Expand the sidebar' : 'Collapse the sidebar')
    }
  })
})
