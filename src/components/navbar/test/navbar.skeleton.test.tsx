import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'
import { NavbarSkeleton } from '../skeleton.js'
import type { NavbarSkeletonProps } from '../types.js'

const html = (props: NavbarSkeletonProps = {}) => markup(<NavbarSkeleton {...props} />)
const root = (props: NavbarSkeletonProps = {}) => classList(html(props))

/** The class list of every element whose class attribute starts with this, in order. */
const tagClasses = (out: string, start: string) =>
  [...out.matchAll(new RegExp(`<span class="${start}[^"]*">`, 'g'))].map((m) => classList(m[0]))
const links = (out: string) => tagClasses(out, 'inline-flex shrink-0 items-center text-sm')

const FLOOR = ['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']
const FILL = ['animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none']

/** What sets the bar's height and edge, written out. */
const BAR = ['min-h-15', 'pb-1.5', 'bg-surface-raised', 'border-b-(length:--tc-line-width)', 'border-line', 'flex', 'flex-wrap', 'w-full']

describe('NavbarSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as NavbarSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('is a div with no landmark, no link, no button and no tab stop, and no client part', () => {
    const out = html()
    expect(out).toMatch(/^<div /)
    expect(out).not.toMatch(/<header|<nav|<a |<button|role=|tabindex|href|hidden=""/)
  })

  it('carries the box of the bar, which decides its height', () => {
    expect(BAR.filter((c) => !root().includes(c))).toEqual([])
  })

  it('keeps every class the bar itself emits, sticky and not', () => {
    for (const sticky of [true, false]) {
      const bar = classList(markup(<NavbarRoot sticky={sticky} />).match(/<header[^>]*>/)?.[0] ?? '')
      expect(bar.filter((c) => !root({ sticky }).includes(c)), String(sticky)).toEqual([])
    }
  })

  it('sticks by default, as the bar does, clearing the safe area; sticky={false} stays in the flow', () => {
    expect(root()).toEqual(expect.arrayContaining(['sticky', 'top-0', 'z-(--tc-z-sticky)', 'pt-[calc(0.375rem+var(--tc-safe-top))]']))
    expect(root({ sticky: false })).toContain('pt-1.5')
    expect(root({ sticky: false })).not.toContain('sticky')
  })

  it('starts with the four links Figma draws, and clamps the count to 1 and 50, dropping a fraction', () => {
    expect(links(html())).toHaveLength(4)
    expect(links(html({ links: 0 }))).toHaveLength(1)
    expect(links(html({ links: -3 }))).toHaveLength(1)
    expect(links(html({ links: 2.7 }))).toHaveLength(2)
    expect(links(html({ links: 999 }))).toHaveLength(50)
  })

  it('gives the brand and every link the type step and the finger floor of the real ones', () => {
    const out = html()
    expect(tagClasses(out, 'inline-flex shrink-0 items-center text-base')[0]).toEqual(expect.arrayContaining(['text-base', ...FLOOR]))
    for (const link of links(out)) expect(link).toEqual(expect.arrayContaining(['text-sm', ...FLOOR]))
    const real = markup(
      <NavbarRoot><NavbarBrand href="/">B</NavbarBrand><NavbarLinks><NavbarLink href="/a">A</NavbarLink></NavbarLinks></NavbarRoot>,
    )
    const anchors = [...real.matchAll(/<a [^>]*>/g)].map((m) => classList(m[0]))
    expect(anchors[0]).toEqual(expect.arrayContaining(['text-base', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']))
    expect(anchors[1]).toEqual(expect.arrayContaining(['text-sm', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']))
  })

  it('lays the links out as the bar does: the same landmark box, an unscrolled row', () => {
    const out = html()
    const landmark = classList(markup(<NavbarLinks />).match(/<nav[^>]*>/)?.[0] ?? '').filter((c) => c !== 'aria-label')
    expect(out).toContain(`<div class="${landmark.join(' ')}"><div class="flex items-center gap-5 overflow-hidden">`)
  })

  it('ends with an action as tall as a Button md, at the end of the bar as NavbarActions puts it', () => {
    const actions = classList(markup(<NavbarActions />))
    const out = html()
    expect(out).toContain(`<div class="${actions.join(' ')}"><span class="`)
    const action = tagClasses(out, 'block w-20')[0] ?? []
    expect(action).toEqual(expect.arrayContaining(['h-control-md', 'rounded-control', ...FLOOR, ...FILL]))
  })

  it('draws each shape with the fill, the pulse and a forced-colours line: a brand bar, the link bars and the action', () => {
    const shapes = [...html().matchAll(/<span class="[^"]*animate-pulse[^"]*">/g)].map((m) => classList(m[0]))
    expect(shapes).toHaveLength(6)
    for (const shape of shapes) expect(shape).toEqual(expect.arrayContaining(FILL))
  })

  it('lets the consumer className win a conflict on the bar, because it is passed last', () => {
    const list = root({ className: 'min-h-20 ms-2' })
    expect(list).toContain('min-h-20')
    expect(list).toContain('ms-2')
    expect(list).not.toContain('min-h-15')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<NavbarSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
