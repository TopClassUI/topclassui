import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { blankComments, packageName, resolveSpecifier, valueImports } from '../../../../scripts/lib/module-graph.js'
import { attr, classList, markup } from '#test/markup.js'
import { COMMAND_ITEM } from '../classes.js'
import { CommandSkeleton } from '../skeleton.js'
import type { CommandSkeletonProps } from '../types.js'

const html = (props: CommandSkeletonProps = {}) => markup(<CommandSkeleton {...props} />)
const rows = (out: string) => [...out.matchAll(/<span class="flex[^"]*">/g)].map((m) => classList(m[0]))
const bars = (out: string) => [...out.matchAll(/<span class="block[^"]*">/g)].map((m) => classList(m[0]).sort())

/** Every class that decides a row's height, written out: one unit, the 44 px floor under a finger, and the type step. */
const HEIGHT = [
  'h-(--tc-row-height)',
  'min-h-(--tc-row-height)',
  'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
  'text-sm',
]

const FILL = ['animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)', 'h-[1em]',
  'motion-reduce:animate-none', 'my-[calc((1lh-1em)/2)]', 'rounded-chip']

describe('CommandSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as CommandSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('holds no option, no button and no tab stop: nothing in it can be reached', () => {
    expect(html()).not.toMatch(/role=|<button|tabindex|href/)
  })

  it('starts with the seven rows the list shows, each an icon and a label of nothing', () => {
    const out = html()
    expect(rows(out)).toHaveLength(7)
    expect(bars(out).slice(0, 2)).toEqual([[...FILL, 'shrink-0', 'w-[1em]'].sort(), [...FILL, 'w-1/2'].sort()])
    expect(bars(out)).toHaveLength(14)
  })

  it('clamps the count to 1 and 100, as visibleRows is, and drops a fraction', () => {
    expect(rows(html({ rows: 0 }))).toHaveLength(1)
    expect(rows(html({ rows: -3 }))).toHaveLength(1)
    expect(rows(html({ rows: 2.7 }))).toHaveLength(2)
    expect(rows(html({ rows: 9999 }))).toHaveLength(100)
  })

  it('every row carries the height classes of a command row, and the row itself carries them too', () => {
    const item = COMMAND_ITEM.split(' ')
    for (const row of rows(html({ rows: 3 }))) {
      expect(HEIGHT.filter((c) => !row.includes(c) || !item.includes(c))).toEqual([])
    }
  })

  it('has the list padding and no scroll: no tab stop inside means nothing may need one', () => {
    const root = classList(html())
    expect(root).toEqual(['flex', 'flex-col', 'p-1.5'])
  })

  it('lets the consumer className win a conflict, because it is passed last', () => {
    expect(classList(html({ className: 'p-0 ms-2' }))).toEqual(['flex', 'flex-col', 'p-0', 'ms-2'])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<CommandSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })

  it('loads no Base UI and no client file, so a page that only shows it stays on the server', () => {
    const file = join(import.meta.dirname, '..', 'skeleton.tsx')
    const specifiers = valueImports(blankComments(readFileSync(file, 'utf8')))
    expect(specifiers.filter((s) => resolveSpecifier(s, file, process.cwd()) === null).map(packageName)).toEqual([])
    expect(specifiers.filter((s) => s.includes('client') || s.includes('parts') || s.includes('hook'))).toEqual([])
  })
})
