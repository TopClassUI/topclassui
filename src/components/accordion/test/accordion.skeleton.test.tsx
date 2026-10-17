import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { AccordionItem, AccordionRoot } from '../client.js'
import { AccordionSkeleton } from '../skeleton.js'
import type { AccordionSkeletonProps } from '../types.js'

const html = (props: AccordionSkeletonProps = {}) => markup(<AccordionSkeleton {...props} />)

/** The class list of every element with this opening tag pattern, in order, sorted. */
const tagClasses = (out: string, pattern: RegExp) => [...out.matchAll(pattern)].map((m) => classList(m[0]).sort())
const items = (out: string) => tagClasses(out, /<div class="border-t[^"]*">/g)
const rows = (out: string) => tagClasses(out, /<div class="flex[^"]*">/g)

/** Every class that decides a row's height, written out: the trigger's padding, type step and finger floor. */
const HEIGHT = ['py-3.5', 'text-sm', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']

const FILL = ['animate-pulse', 'bg-neutral-soft', 'block', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none', 'rounded-chip']
const TITLE = [...FILL, 'h-[1em]', 'min-w-0', 'my-[calc((1lh-1em)/2)]', 'shrink', 'w-48'].sort()
const CARET = [...FILL, 'ms-auto', 'shrink-0', 'size-[1em]'].sort()

describe('AccordionSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as AccordionSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('holds no button, no heading, no region and no tab stop: nothing in it can be reached', () => {
    expect(html()).not.toMatch(/role=|<button|<h[1-6]|tabindex|href/)
  })

  it('starts with the three items Figma draws, each a title bar and a caret', () => {
    const out = html()
    expect(items(out)).toHaveLength(3)
    expect(tagClasses(out, /<span class="[^"]*">/g)).toEqual([TITLE, CARET, TITLE, CARET, TITLE, CARET])
  })

  it('clamps the count to 1 and 100, and drops a fraction', () => {
    expect(items(html({ items: 0 }))).toHaveLength(1)
    expect(items(html({ items: -4 }))).toHaveLength(1)
    expect(items(html({ items: 2.7 }))).toHaveLength(2)
    expect(items(html({ items: 999 }))).toHaveLength(100)
  })

  it('wears the box of the root and the line of an item, so the edges are where the accordion draws them', () => {
    const out = html()
    expect(classList(out)).toEqual(expect.arrayContaining(['rounded-box', 'bg-surface-raised', 'overflow-hidden', 'border-(length:--tc-line-width)', 'border-line']))
    expect(items(out)[0]).toEqual(['border-line', 'border-t-(length:--tc-line-width)', 'first:border-t-0'])
  })

  it('every row carries the padding, the type step and the finger floor of a closed trigger', () => {
    for (const row of rows(html())) expect(HEIGHT.filter((c) => !row.includes(c))).toEqual([])
  })

  it('reserves the padding and type step the trigger itself emits', () => {
    const trigger = classList(markup(
      <AccordionRoot><AccordionItem value="a" title="A" headingLevel={2}>x</AccordionItem></AccordionRoot>,
    ).match(/<button[^>]*>/)?.[0] ?? '')
    const row = rows(html())[0] ?? []
    expect(['px-4', 'py-3.5', 'text-sm', 'gap-3'].filter((c) => !trigger.includes(c) || !row.includes(c))).toEqual([])
  })

  it('lets the consumer className win a conflict on the root, because it is passed last', () => {
    const list = classList(html({ className: 'rounded-none ms-2' }))
    expect(list).toContain('rounded-none')
    expect(list).toContain('ms-2')
    expect(list).not.toContain('rounded-box')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<AccordionSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
