import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the pages the browser tests measure, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

interface Shape {
  /** Every href in the demo, in the order the keyboard reaches them. */
  hrefs: string[]
  /** The hrefs of the links marked as the page being read, one a bar at most. */
  current: string[]
  /** The name of each nav, one a bar. */
  navs: string[]
  /** How many of the bars hold their client part. */
  sticky: number
}

/** Written out per demo, so a demo that changes, or a part that stops rendering a link, fails here. */
const DEMOS: Record<string, Shape> = {
  'basic': { hrefs: ['/', '/docs', '/components', '/icons', '/theming', '/login'], current: ['/docs'], navs: ['Main'], sticky: 1 },
  'many-links': {
    hrefs: ['/', '/docs', '/components', '/icons', '/theming', '/connectors', '/changelog', 'https://github.com/TopClassUI/topclassui', '/login'],
    current: ['/components'], navs: ['Main'], sticky: 1,
  },
  'not-sticky': { hrefs: ['/', '/docs', '/blog', '/changelog'], current: ['/blog'], navs: ['Main'], sticky: 0 },
  'playground': { hrefs: ['/', '/docs', '/components', '/icons', '/login'], current: [], navs: ['Main'], sticky: 1 },
  'rtl': { hrefs: ['/', '/docs', '/components', '/icons', '/theming', '/login'], current: ['/docs'], navs: ['التنقل الرئيسي'], sticky: 1 },
  'tall-page': {
    hrefs: ['#install', '#install', '#usage', '#theming', '#questions', '/handbook/edit', '#usage', '#theming', '#questions', '#install'],
    current: [], navs: ['On this page'], sticky: 1,
  },
  'states': {
    hrefs: ['/', '/docs', '/components', '/icons', '/theming', '/login', '/', '/blog', '/changelog'],
    current: ['/docs'], navs: ['Sticky, Docs being read', 'In the flow, nothing being read'], sticky: 1,
  },
  'with-search': { hrefs: ['/', '/docs', '/components', '/icons'], current: ['/docs'], navs: ['Main'], sticky: 1 },
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos the brief asks for, so none can be deleted silently', () => {
    expect(files).toEqual(['basic', 'many-links', 'not-sticky', 'playground', 'rtl', 'states', 'tall-page', 'with-search'])
    expect(Object.keys(DEMOS).sort()).toEqual(files)
  })

  for (const [file, shape] of Object.entries(DEMOS)) {
    it(`${file}.tsx: one header and one nav a bar, named ${shape.navs.join(', ')}`, async () => {
      const html = await render(file)
      expect(html.match(/<header /g), file).toHaveLength(shape.navs.length)
      expect([...html.matchAll(/<nav aria-label="([^"]*)"/g)].map((match) => match[1]), file).toEqual(shape.navs)
    })

    it(`${file}.tsx: every link is a real anchor, with the hrefs written here`, async () => {
      const html = await render(file)
      expect([...html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((match) => match[1]), file).toEqual(shape.hrefs)
      // No anchor without an href, and nothing that only looks like a link.
      expect(html.match(/<a /g), file).toHaveLength(shape.hrefs.length)
      expect(html, file).not.toContain('role="link"')
    })

    it(`${file}.tsx: ${shape.current.length === 0 ? 'no link' : shape.current.join(' and ')} is the page being read`, async () => {
      const marked = [...(await render(file)).matchAll(/<a aria-current="page" [^>]*href="([^"]*)"/g)].map((match) => match[1])
      expect(marked, file).toEqual(shape.current)
    })

    it(`${file}.tsx: ${String(shape.sticky)} of its bars hold the one client part, which draws nothing`, async () => {
      expect((await render(file)).match(/<span hidden=""><\/span><\/header>/g) ?? [], file).toHaveLength(shape.sticky)
    })

    it(`${file}.tsx writes no tabIndex: every stop is a link, a button or a field`, () => {
      expect(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8'), file).not.toMatch(/tabIndex/)
    })
  }
})

describe('what each demo is there to show', () => {
  it('many-links: six links, more than a phone has room for, and two actions', async () => {
    const html = await render('many-links')
    expect(html.match(/<li /g)).toHaveLength(6)
    expect(html).toContain('aria-label="GitHub"')
  })

  it('with-search: a search form that is a plain GET, a named field and a named avatar', async () => {
    const html = await render('with-search')
    expect(html).toContain('<form role="search" class="min-w-0" action="/search">')
    expect(html).toMatch(/<input [^>]*type="search"/)
    expect(html).toContain('aria-label="Search the docs"')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Omar Abed"')
  })

  it('not-sticky: the header has nothing that sticks', async () => {
    const html = await render('not-sticky')
    expect(/<header class="([^"]*)"/.exec(html)?.[1]?.split(' ')).not.toContain('sticky')
  })

  it('tall-page: four headings the links point at, each in a part as tall as the screen', async () => {
    const html = await render('tall-page')
    expect([...html.matchAll(/<h2 id="([^"]*)"/g)].map((match) => match[1])).toEqual(['install', 'usage', 'theming', 'questions'])
    expect(html.match(/<section aria-labelledby="[a-z]+" class="min-h-dvh /g)).toHaveLength(4)
  })

  it('rtl: the direction and the language are on the page around the bar, and the labels are the Arabic ones', async () => {
    const html = await render('rtl')
    expect(html.startsWith('<div dir="rtl" lang="ar"><header ')).toBe(true)
    expect(readFileSync(join(DUMMY, 'rtl.tsx'), 'utf8')).toContain('<NavbarLinks labels={ar}>')
    expect(html).not.toContain('aria-label="Main"')
  })

  it('no demo writes a class for a side: the same markup is mirrored by dir alone', () => {
    for (const file of files) {
      expect(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8'), file).not.toMatch(/\b(ml|mr|pl|pr|left|right)-\d|text-(left|right)/)
    }
  })
})
