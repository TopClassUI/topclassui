import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import TenThousand from '../dummy/ten-thousand.js'
import { TreeView } from '../index.js'
import type { TreeViewProps } from '../types.js'

// The ssr project: what reaches the HTML before any script runs.
const ITEMS = [
  {
    id: 'app', label: 'app', children: [
      { id: 'layout', label: 'layout.tsx', icon: <b>i</b> },
      { id: 'page', label: 'page.tsx', disabled: true },
    ],
  },
  { id: 'lib', label: 'lib', children: [] },
  { id: 'readme', label: 'README.md' },
]

const html = (props: Partial<TreeViewProps> = {}) => markup(<TreeView aria-label="Files" items={ITEMS} {...props} />)
const tree = (out: string) => /<div [^>]*role="tree"[^>]*>/.exec(out)?.[0] ?? ''
const rows = (out: string) => [...out.matchAll(/<div [^>]*role="treeitem"[^>]*>/g)].map(([row]) => row)
/** Each row as its level, position, set size, expanded and selected, in that order. */
const aria = (out: string) => rows(out).map((row) => [
  attr(row, 'aria-level'), attr(row, 'aria-posinset'), attr(row, 'aria-setsize'), attr(row, 'aria-expanded') ?? '-',
  attr(row, 'aria-selected'), attr(row, 'aria-disabled') ?? '-',
].join(' '))

describe('on the server', () => {
  it('one element with role tree, named, and the one tab stop while it has rows', () => {
    const out = html()
    expect(tree(out)).toMatch(/ role="tree" tabindex="0"/)
    expect(attr(tree(out), 'aria-label')).toBe('Files')
    expect(attr(tree(out), 'aria-activedescendant')).toBeUndefined()
    expect(attr(tree(markup(<TreeView aria-labelledby="h" items={ITEMS} />)), 'aria-labelledby')).toBe('h')
  })

  it('the rows are flat siblings with their level, position, set size, expanded, selected and disabled', () => {
    expect(aria(html({ defaultExpanded: ['app'], defaultValue: 'layout' }))).toEqual([
      '1 1 3 true false -',
      '2 1 2 - true -',
      '2 2 2 - false true',
      '1 2 3 false false -',
      '1 3 3 - false -',
    ])
  })

  it('every row has an id of its own, and its indent level as a bare number', () => {
    const found = rows(html({ defaultExpanded: ['app'] }))
    expect(new Set(found.map((row) => attr(row, 'id'))).size).toBe(5)
    expect(found.map((row) => attr(row, 'style'))).toEqual([
      '--tc-tree-level:0', '--tc-tree-level:1', '--tc-tree-level:1', '--tc-tree-level:0', '--tc-tree-level:0',
    ])
  })

  it('value wins over defaultValue, and expanded over defaultExpanded', () => {
    const out = html({ value: 'readme', defaultValue: 'app', expanded: [], defaultExpanded: ['app'] })
    expect(aria(out)).toEqual(['1 1 3 false false -', '1 2 3 false false -', '1 3 3 - true -'])
  })

  it('a closed branch carries the right caret, an open one the down caret, a leaf an empty slot of the same width', () => {
    const out = html({ defaultExpanded: ['app'] })
    const slots = [...out.matchAll(/<span aria-hidden="true" class="flex size-3 [^"]*">(.*?)<\/span>/g)].map(([, inner]) => inner ?? '')
    expect(slots.map((inner) => (inner.includes('M181.66,133.66') ? 'right' : inner.includes('<svg') ? 'down' : 'none'))).toEqual(['down', 'none', 'none', 'right', 'none'])
    expect(out).toContain('scale-x-(--tc-dir)')
  })

  it('the icon sits in a hidden wrapper, and the label in a span of its own direction that truncates', () => {
    const out = html({ defaultExpanded: ['app'] })
    expect(out).toMatch(/<span aria-hidden="true" class="flex shrink-0 text-body [^"]*"><b>i<\/b><\/span><span dir="auto" class="truncate min-w-0">layout\.tsx<\/span>/)
    expect([...out.matchAll(/<span dir="auto"/g)]).toHaveLength(5)
  })

  it('className, style and the rest reach the tree; the spacers and the caller style are set together', () => {
    const out = html({ className: 'ms-2', style: { marginBlock: 4 }, title: 'Repo', id: 'files' })
    expect(attr(tree(out), 'class')?.endsWith(' ms-2')).toBe(true)
    expect(attr(tree(out), 'style')).toBe('margin-block:4px;--tc-list-pad-start:0px;--tc-list-pad-end:0px')
    expect(attr(tree(out), 'title')).toBe('Repo')
    expect(attr(tree(out), 'id')).toBe('files')
    expect(out.startsWith('<div class="grid min-w-0 grid-cols-1"><div ')).toBe(true)
  })

  it('visibleRows is clamped to 1 and 20 and written as --tc-list-rows; left out, the knob applies', () => {
    expect(attr(tree(html({ visibleRows: 50 })), 'style')).toContain('--tc-list-rows:20')
    expect(attr(tree(html({ visibleRows: 0 })), 'style')).toContain('--tc-list-rows:1')
    expect(attr(tree(html()), 'style')).not.toContain('--tc-list-rows')
  })

  it('a windowed tree fills the rows its box is drawn to show before anything is measured, up to visibleRows of 20', () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({ id: `n${String(index)}`, label: `Node ${String(index)}` }))
    expect(rows(html({ items: many, visibleRows: 20 })).length).toBeGreaterThanOrEqual(20)
    expect(rows(html({ items: many, visibleRows: 99 })).length).toBeLessThan(40)
  })

  it('status: busy while loading, the note says so outside the tree, and idle writes nothing', () => {
    const note = (out: string) => /<div role="status" class="[^"]*">(.*?)<\/div>/.exec(out)?.[1]?.replace(/<[^>]*>/g, '')
    expect(attr(tree(html({ status: 'loading' })), 'aria-busy')).toBe('true')
    expect(attr(tree(html({ status: 'loading-more' })), 'aria-busy')).toBe('true')
    expect(attr(tree(html()), 'aria-busy')).toBeUndefined()
    expect([html({ status: 'loading' }), html({ status: 'loading-more' }), html({ status: 'empty', items: [] }), html()].map(note))
      .toEqual(['Loading', 'Loading more', 'Nothing here yet', ''])
    expect(note(html({ status: 'loading', loadingFallback: 'Fetching' }))).toBe('Fetching')
    expect(note(html({ status: 'empty', emptyFallback: 'No files', items: [] }))).toBe('No files')
  })

  it('status: two hidden bars stand for the loading words, which stay in the live region; empty draws the tray over its words', () => {
    const inner = (out: string) => /<div role="status" class="[^"]*">(.*?)<\/div>/.exec(out)?.[1] ?? ''
    for (const status of ['loading', 'loading-more'] as const) {
      const out = inner(html({ status }))
      expect(out.match(/<span aria-hidden="true" class="block h-2 rounded-chip bg-neutral-soft animate-pulse/g), status).toHaveLength(2)
      expect(out, status).toMatch(/<span class="sr-only">Loading/)
    }
    expect(inner(html({ status: 'loading', loadingFallback: 'Fetching' }))).toBe('<span class="">Fetching</span>')
    const empty = inner(html({ status: 'empty', items: [] }))
    expect(empty).toMatch(/^<svg [^>]*aria-hidden="true"[^>]*>.*<\/svg><span class="">Nothing here yet<\/span>$/)
    expect(inner(html({ status: 'empty', emptyFallback: 'No files', items: [] }))).toBe('<span class="">No files</span>')
  })

  it('with no rows the tree is no tab stop', () => {
    expect(tree(html({ items: [] }))).not.toContain('tabindex')
  })

  it('ten-thousand: the server writes its first window only, and a spacer for the rest', () => {
    const out = markup(<TenThousand />)
    expect(rows(out).length).toBeGreaterThan(0)
    expect(rows(out).length).toBeLessThan(30)
    expect(attr(rows(out)[0] ?? '', 'aria-setsize')).toBe('10')
    expect(Number(/--tc-list-pad-end:(\d+)px/.exec(out)?.[1])).toBeGreaterThan(310_000)
  })
})
