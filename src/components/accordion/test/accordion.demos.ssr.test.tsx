import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'disabled', 'first-open', 'long-content', 'many-items', 'multiple', 'rtl', 'skeleton']

/** How many triggers a demo holds, and which of them are open in the server HTML, by position. */
const TRIGGERS: Record<string, { count: number, open: number[] }> = {
  'basic': { count: 3, open: [] },
  'disabled': { count: 3, open: [] },
  'first-open': { count: 3, open: [0] },
  // Four items, all open but the table, and the two of the accordion inside the last panel.
  'long-content': { count: 6, open: [0, 1, 3] },
  'many-items': { count: 60, open: [] },
  'multiple': { count: 3, open: [0, 1] },
  'rtl': { count: 3, open: [0] },
  // The skeletons themselves have no trigger: these are the closed accordions beside them.
  'skeleton': { count: 4, open: [] },
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

const triggersOf = (html: string) => html.match(/<button [^>]*aria-expanded="[^"]*"[^>]*>/g) ?? []

describe('every demo renders on the server', () => {
  it('holds exactly the demos the brief asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
    })

    it(`${file}.tsx renders its triggers as buttons, open or closed as written`, async () => {
      const found = triggersOf(await render(file))
      expect(found, file).toHaveLength(TRIGGERS[file]?.count ?? -1)
      const open = found.flatMap((button, index) => (button.includes('aria-expanded="true"') ? [index] : []))
      expect(open, file).toEqual(TRIGGERS[file]?.open)
    })

    it(`${file}.tsx puts every trigger in a heading, and none in the default h3 at the top level`, async () => {
      const html = await render(file)
      const headings = html.match(/<h[1-6] [^>]*><button /g) ?? []
      expect(headings, file).toHaveLength(TRIGGERS[file]?.count ?? -1)
      // The page's own heading is the h1, so the items of a demo are h2: an h3 there skips a level.
      expect(html.indexOf('<h3 '), file).toBe(file === 'long-content' ? html.indexOf('<h3 ', html.lastIndexOf('<h2 ')) : -1)
    })

    it(`${file}.tsx sends the text of every panel, open or closed`, async () => {
      const html = await render(file)
      const regions = html.match(/<div role="region"/g) ?? []
      expect(regions, file).toHaveLength(TRIGGERS[file]?.count ?? -1)
    })

    it(`${file}.tsx uses no svg outside Svg, and no title on an element`, async () => {
      const html = await render(file)
      for (const svg of html.match(/<svg [^>]*>/g) ?? []) expect(svg, file).toContain('aria-hidden="true"')
      expect(html, file).not.toMatch(/ title="/)
    })
  }
})

describe('what each demo shows', () => {
  it('basic: the three answers are in the HTML though every panel is closed', async () => {
    const html = await render('basic')
    expect(html).toContain('A component that renders on the server and sends HTML')
    expect(html).toContain('About one kilobyte in the browser.')
    expect(html.match(/ hidden=""/g)).toHaveLength(3)
  })

  it('disabled: the middle trigger alone says it is disabled', async () => {
    expect(triggersOf(await render('disabled')).map((button) => /aria-disabled="(\w+)"/.exec(button)?.[1]))
      .toEqual(['false', 'true', 'false'])
  })

  it('many-items: sixty answers, from the first to the last', async () => {
    const html = await render('many-items')
    expect(html).toContain('<p>The answer to question 1.</p>')
    expect(html).toContain('<p>The answer to question 60.</p>')
  })

  it('rtl: an island that carries its direction and its language, and names neither on the accordion', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar"><div data-orientation="vertical" class="grid ')
    expect(html.match(/ dir="/g)).toHaveLength(1)
  })

  it('long-content: a title of 300 letters, a title that is an element, a table and an accordion in a panel', async () => {
    const html = await render('long-content')
    expect(html).toContain(`<span class="min-w-0 grow basis-[6ch]">${'a'.repeat(300)}</span>`)
    expect(html).toMatch(/<span class="min-w-0 grow basis-\[6ch\]"><span class="flex flex-wrap items-center gap-2"><span>Invoices<\/span><span data-variant=/)
    expect(html.match(/<table /g)).toHaveLength(1)
    expect(html.match(/<h3 /g)).toHaveLength(2)
    // The one link of the demo is a Button, as the target-size spec needs.
    expect(html.match(/<a [^>]*>/g)).toHaveLength(1)
    expect(html).toMatch(/<a [^>]*href="\/orders"[^>]*data-variant="outline"/)
  })
})
