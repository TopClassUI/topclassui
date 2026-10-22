import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-5.md, Demos). */
const EXPECTED = ['basic', 'load-more', 'long-content', 'playground', 'rtl', 'selected', 'stage', 'states', 'status', 'ten-thousand']

/** Each tree of each demo as the server writes it: its name, a tab stop or not, and the first rows it holds. */
const TREES: Record<string, string[]> = {
  'basic': ['Files 0: src, app, layout.tsx, page.tsx, components, lib, package.json, README.md'],
  'load-more': ['Repository 0: Folder 1, Folder 2, Folder 3, Folder 4, Folder 5, Folder 6, Folder 7, Folder 8'],
  'long-content': ['Every hostile case 0: Supercalifragilistic, تقرير report 2026 ال, Level 1, Level 2, Level 3, Level 4, Level 5, Level 6'],
  'playground': ['Files 0: components, button, index.tsx, variants.ts, input'],
  'rtl': ['الملفات 0: المستندات, التقرير السنوي.pdf, الميزانية.xlsx, الصور, ملاحظات.txt'],
  'selected': ['Project 0: app, layout.tsx, page.tsx, docs, next.config.ts'],
  'stage': ['Files 0: components, button, index.tsx, variants.ts, input'],
  'states': [
    'Source, collapsed 0: src',
    'Source, expanded 0: src, file1, file2',
    'Source, selected 0: src, file1, file2',
    'Source, focus-visible 0: src, file1, file2',
    'Source, loading -: ',
    'Source, empty -: ',
  ],
  'status': ['Files, loading -: ', 'Files, empty -: '],
  'ten-thousand': ['Ten thousand files 0: Folder 1, File 1.ts, File 2.ts, File 3.ts, File 4.ts, File 5.ts, File 6.ts, File 7.ts'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, the tab stop, and the first eight labels. */
function treesIn(html: string): string[] {
  return [...html.matchAll(/<div [^>]*role="tree"[^>]*>([\s\S]*?)<\/div><div role="status"/g)].map(([whole, inner]) => {
    const open = /^<div [^>]*>/.exec(whole)?.[0] ?? ''
    const own = /aria-label="([^"]*)"/.exec(open)?.[1]
    const by = /aria-labelledby="([^"]*)"/.exec(open)?.[1]
    const text = by ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    const labels = [...(inner ?? '').matchAll(/<span dir="auto"[^>]*>([^<]*)</g)].map(([, label]) => (label ?? '').slice(0, 20)).slice(0, 8)
    return `${own ?? text ?? '(no name)'} ${/tabindex="(\d)"/.exec(open)?.[1] ?? '-'}: ${labels.join(', ')}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each tree named, one tab stop while it has rows, with its first rows`, async () => {
      expect(treesIn(await render(file)), file).toEqual(TREES[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex or a render', () => {
    expect(sources.filter(([, source]) => /tabIndex|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('only load-more is a client file: it holds the pages, and a TreeView otherwise takes only data', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual(['load-more'])
  })
})

describe('the demos the plan names', () => {
  it('selected: the selected row is the page file, inside its open folder', async () => {
    expect(await render('selected')).toMatch(/aria-selected="true"[^>]*>(<span[^>]*>.*?<\/span>)*<span dir="auto"[^>]*>page\.tsx</)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar"><div class="grid/)
  })

  it('ten-thousand: the server fills the 12-row box it draws, so no row of it stays blank until hydration', async () => {
    const html = await render('ten-thousand')
    expect(html).toContain('--tc-list-rows:12')
    const rows = [...html.matchAll(/role="treeitem"/g)].length
    expect(rows).toBeGreaterThanOrEqual(12)
    expect(rows).toBeLessThan(30)
  })

  it('status: the loading tree is busy and says Loading; the empty one says Nothing here yet', async () => {
    const html = await render('status')
    expect([...html.matchAll(/aria-busy="true"/g)]).toHaveLength(1)
    expect([...html.matchAll(/<div role="status"[^>]*>(.*?)<\/div>/g)].map(([, inner]) => inner?.replace(/<[^>]*>/g, ''))).toEqual(['Loading', 'Nothing here yet'])
  })
})
