import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { SidebarRoot } from '../client.js'
import { SidebarBody } from '../parts/sidebar-body.js'
import { SidebarGroup } from '../parts/sidebar-group.js'
import { SidebarHeader } from '../parts/sidebar-header.js'
import { SidebarLink } from '../parts/sidebar-link.js'
import { SidebarSkeleton } from '../skeleton.js'
import type { SidebarSkeletonProps } from '../types.js'

const html = (props: SidebarSkeletonProps = {}) => markup(<SidebarSkeleton {...props} />)

/** The class list of every element whose class attribute starts with this, in order. */
const tagClasses = (out: string, start: string) => [...out.matchAll(new RegExp(`<[a-z]+ class="${start}[^"]*">`, 'g'))].map((m) => classList(m[0]))
const rows = (out: string) => tagClasses(out, 'pointer-coarse:min-h-')
const icons = (out: string) => tagClasses(out, 'block size-')
const bars = (out: string) => tagClasses(out, 'block h-')

const real = (open: boolean) => markup(
  <SidebarRoot defaultOpen={open}>
    <SidebarHeader>Workspace</SidebarHeader>
    <SidebarBody><SidebarGroup><SidebarLink href="#a" icon={<svg />}>A</SidebarLink></SidebarGroup></SidebarBody>
  </SidebarRoot>,
)

const FILL = ['animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none']

describe('SidebarSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as SidebarSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('holds no nav, no link, no button, no list and no tab stop: nothing in it can be reached or announced', () => {
    for (const open of [true, false]) expect(html({ expanded: open })).not.toMatch(/<nav|<a |<button|<ul|role=|tabindex|href/)
  })

  it('starts expanded with the four links Figma draws: a toggle and a title, then an icon and a label a row', () => {
    const out = html()
    expect(attr(out, 'data-open')).toBe('')
    expect(attr(out, 'data-closed')).toBeUndefined()
    expect(rows(out)).toHaveLength(4)
    expect(icons(out)).toHaveLength(4)
    expect(bars(out)).toHaveLength(5)
    expect(out.match(/animate-pulse/g)).toHaveLength(10)
  })

  it('collapsed: the rail of icons, with no title and no label to hide', () => {
    const out = html({ expanded: false })
    expect(attr(out, 'data-closed')).toBe('')
    expect(attr(out, 'data-open')).toBeUndefined()
    expect(icons(out)).toHaveLength(4)
    expect(bars(out)).toEqual([])
    expect(out.match(/animate-pulse/g)).toHaveLength(5)
  })

  it('clamps the count to 1 and 200, and drops a fraction', () => {
    expect(rows(html({ links: 0 }))).toHaveLength(1)
    expect(rows(html({ links: -3 }))).toHaveLength(1)
    expect(rows(html({ links: 2.7 }))).toHaveLength(2)
    expect(rows(html({ links: 999 }))).toHaveLength(200)
  })

  it('is the rail of the real one: its root classes, its 220 and 60 px widths and the coarse floor of a collapsed rail', () => {
    for (const open of [true, false]) {
      const rail = classList(real(open).match(/<nav [^>]*>/)?.[0] ?? '')
      expect(classList(html({ expanded: open })).sort(), String(open)).toEqual(rail.sort())
    }
    expect(classList(html())).toEqual(expect.arrayContaining(['data-open:w-55', 'data-closed:w-15', 'h-full', 'p-2.5', 'gap-1']))
  })

  it('a header of the real one, and a toggle box with its floor on every pointer and its radius', () => {
    const header = (out: string) => tagClasses(out, 'flex shrink-0')[0] ?? []
    expect(header(html()).sort()).toEqual(header(real(true)).sort())
    expect(tagClasses(html(), 'block shrink-0')[0]).toEqual(expect.arrayContaining([
      ...FILL, 'rounded-control', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
    ]))
  })

  it('a row keeps the row height over the 24 px floor, and the 44 px floor under a finger, as a link does', () => {
    const link = classList(real(true).match(/<a [^>]*>/)?.[0] ?? '')
    for (const row of rows(html())) {
      expect(row).toContain('min-h-(--tc-row-height)')
      expect(row).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      expect(row).not.toContain('min-h-[var(--tc-target-min,24px)]')
      expect(['min-h-(--tc-row-height)', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'px-3', 'gap-2', 'text-sm',
        'group-data-closed/sidebar:justify-center'].filter((c) => !link.includes(c) || !row.includes(c))).toEqual([])
    }
  })

  it('an icon of 1em, the size of the svg in a link, and bars of one line, each a shape that pulses and keeps a line in forced colours', () => {
    expect(icons(html())[0]).toEqual(expect.arrayContaining([...FILL, 'size-[1em]', 'shrink-0']))
    for (const bar of bars(html())) expect(bar).toEqual(expect.arrayContaining([...FILL, 'h-[1em]', 'my-[calc((1lh-1em)/2)]']))
  })

  it('never scrolls: no tab stop inside means nothing may need one', () => {
    expect(html()).not.toMatch(/overflow-y-auto|overflow-auto/)
  })

  it('lets the consumer className win a conflict on the root, because it is passed last', () => {
    const list = classList(html({ className: 'data-open:w-72 ms-2' }))
    expect(list).toContain('data-open:w-72')
    expect(list).toContain('ms-2')
    expect(list).not.toContain('data-open:w-55')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<SidebarSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
