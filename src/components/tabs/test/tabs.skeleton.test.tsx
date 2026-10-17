import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { TabsList, TabsRoot, TabsTab } from '../client.js'
import { TabsSkeleton } from '../skeleton.js'
import type { TabsSkeletonProps } from '../types.js'

const html = (props: TabsSkeletonProps = {}) => markup(<TabsSkeleton {...props} />)

/** The class list of every element with this opening tag pattern, in order. */
const tagClasses = (out: string, pattern: RegExp) => [...out.matchAll(pattern)].map((m) => classList(m[0]))
const tabs = (out: string) => tagClasses(out, /<span class="inline-flex[^"]*">/g)
const list = (out: string) => tagClasses(out, /<div class="flex[^"]*">/g)[0] ?? []

/** Every class that decides a tab's height, written out per size. */
const HEIGHT = {
  xs: ['h-control-xs', 'text-xs'],
  sm: ['h-control-sm', 'text-sm'],
  md: ['h-control-md', 'text-sm'],
  lg: ['h-control-lg', 'text-base'],
  xl: ['h-control-xl', 'text-base'],
} as const

const FLOOR = ['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']

const BAR = [
  'animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)', 'h-[1em]',
  'motion-reduce:animate-none', 'my-[calc((1lh-1em)/2)]', 'rounded-chip', 'w-16',
]

describe('TabsSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as TabsSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('holds no tab, no button and no tab stop: nothing in it can be reached', () => {
    expect(html()).not.toMatch(/role=|<button|tabindex|href/)
  })

  it('starts with the three tabs Figma draws, each holding one bar', () => {
    const out = html()
    expect(tabs(out)).toHaveLength(3)
    expect(tagClasses(out, /<span class="block[^"]*">/g).map((bar) => bar.sort())).toEqual([BAR, BAR, BAR])
  })

  it('clamps the count to 1 and 50, and drops a fraction', () => {
    expect(tabs(html({ tabs: 0 }))).toHaveLength(1)
    expect(tabs(html({ tabs: -4 }))).toHaveLength(1)
    expect(tabs(html({ tabs: 2.7 }))).toHaveLength(2)
    expect(tabs(html({ tabs: 999 }))).toHaveLength(50)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size}: every tab carries the height, the type step and the finger floor of a real tab`, () => {
      for (const tab of tabs(html({ size }))) {
        expect([...HEIGHT[size], ...FLOOR].filter((c) => !tab.includes(c)), size).toEqual([])
      }
    })

    it(`${size}: reserves the same height classes the tab itself emits`, () => {
      const real = classList(markup(
        <TabsRoot size={size} defaultValue="a"><TabsList aria-label="x"><TabsTab value="a">A</TabsTab></TabsList></TabsRoot>,
      ).match(/<button[^>]*>/)?.[0] ?? '')
      const skeleton = tabs(html({ size }))[0] ?? []
      expect(HEIGHT[size].filter((c) => !real.includes(c) || !skeleton.includes(c)), size).toEqual([])
    })
  }

  it('emits no size classes for custom, like the tabs', () => {
    for (const tab of tabs(html({ size: 'custom' }))) expect(tab.filter((c) => /^(h-control|px-|text-)/.test(c))).toEqual([])
  })

  it('starts at md and the line look, the tabs defaults', () => {
    expect(html()).toBe(html({ size: 'md', variant: 'line' }))
    expect(attr(html(), 'data-variant')).toBe('line')
    expect(attr(html(), 'data-size')).toBe('md')
  })

  it('line: the hairline under the list, and a transparent 2 px bar under each tab, so a tab is as tall as a real one', () => {
    const out = html({ variant: 'line' })
    expect(list(out)).toEqual(expect.arrayContaining(['overflow-hidden', 'shadow-[inset_0_calc(var(--tc-line-width)*-1)_var(--tc-line)]']))
    expect(tabs(out)[0]).toEqual(expect.arrayContaining(['border-b-2', 'border-transparent', 'forced-colors:border-[Canvas]']))
  })

  it('enclosed: the tinted box with its padding, and rounded tabs with no bar', () => {
    const out = html({ variant: 'enclosed' })
    expect(list(out)).toEqual(expect.arrayContaining(['bg-surface', 'overflow-hidden', 'p-1', 'rounded-control', 'w-fit']))
    expect(tabs(out)[0]).toContain('rounded-control')
    expect(tabs(out)[0]).not.toContain('border-b-2')
  })

  it('never scrolls: no tab stop inside means nothing may need one', () => {
    for (const variant of ['line', 'enclosed'] as const) {
      expect(list(html({ variant })).filter((c) => c.startsWith('overflow-x')), variant).toEqual([])
    }
  })

  it('lets the consumer className win a conflict on the root, because it is passed last', () => {
    expect(classList(html({ className: 'grid-cols-2 ms-2' }))).toEqual(['grid', 'grid-cols-2', 'ms-2'])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<TabsSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
