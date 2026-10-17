import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { TIMELINE_BOUNDARIES } from '../boundaries.js'
import { TIMELINE_SKELETON_DEFAULTS } from '../constants.js'
import { timelineSkeletonSchema } from '../schema.js'
import { TimelineSkeleton } from '../skeleton.js'
import type { TimelineSkeletonProps } from '../types.js'

const html = (props: TimelineSkeletonProps = {}) => markup(<TimelineSkeleton {...props} />)

const rows = (out: string) => out.match(/<div class="flex gap-3">/g)?.length ?? 0
const connectors = (out: string) => out.match(/<span class="block w-0\.5 flex-1 bg-line[^"]*"><\/span>/g)?.length ?? 0
const padded = (out: string) => out.match(/<div class="flex min-w-0 flex-1 flex-col gap-0\.5 pb-4">/g)?.length ?? 0
const shapes = (out: string) => [...out.matchAll(/<span class="([^"]*animate-pulse[^"]*)"><\/span>/g)].map((m) => (m[1] ?? '').split(' ').sort())

const FILL = ['animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none']
const DOT = [...FILL, 'block', 'rounded-full', 'size-3'].sort()
const BAR = [...FILL, 'block', 'h-[1em]', 'my-[calc((1lh-1em)/2)]', 'rounded-chip', 'w-full']
const TITLE = [...BAR, 'max-w-48'].sort()
const TIME = [...BAR, 'max-w-24'].sort()

describe('TimelineSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as TimelineSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('has no list semantics and nothing a reader or a key could reach', () => {
    expect(html()).not.toMatch(/<ol|<li|role=|tabindex|<button|href/)
  })

  it('starts with three rows, each a dot, a title line and a time line', () => {
    const out = html()
    expect(rows(out)).toBe(3)
    expect(shapes(out)).toEqual([DOT, TITLE, TIME, DOT, TITLE, TIME, DOT, TITLE, TIME])
  })

  it('draws a connector and the gap under every row but the last, as the timeline does', () => {
    expect([connectors(html()), padded(html())]).toEqual([2, 2])
    expect([connectors(html({ rows: 1 })), padded(html({ rows: 1 }))]).toEqual([0, 0])
  })

  it('wears the classes of an item, so a row is as tall as an event with a title and a time', () => {
    const out = html({ rows: 1 })
    expect(out).toContain('<span class="flex min-h-5 shrink-0 items-center">')
    expect(out).toContain('<div class="min-h-5 text-sm font-medium text-body">')
    expect(out).toContain('<div class="text-xs text-muted">')
  })

  it('clamps the count to 1 and 500, and drops a fraction', () => {
    expect(rows(html({ rows: 0 }))).toBe(1)
    expect(rows(html({ rows: -3 }))).toBe(1)
    expect(rows(html({ rows: 2.7 }))).toBe(2)
    expect(rows(html({ rows: 9999 }))).toBe(500)
  })

  it('declares the count with the same numbers it is clamped to (R-8.3-6)', () => {
    expect(TIMELINE_BOUNDARIES).toEqual({ skeletonRowsMin: 1, skeletonRowsMax: 500 })
    expect(TIMELINE_SKELETON_DEFAULTS).toEqual({ rows: 3 })
    const json = z.toJSONSchema(timelineSkeletonSchema, { io: 'input' }) as { properties?: Record<string, { description?: string }> }
    expect(json.properties?.['rows']).toMatchObject({ type: 'integer', minimum: 1, maximum: 500, default: 3 })
    expect((json.properties?.['rows']?.description ?? '').length).toBeGreaterThan(10)
  })

  it('lets the consumer className win a conflict on the root, because it is passed last', () => {
    expect(classList(html({ className: 'flex-row ms-2' }))).toEqual(['flex', 'flex-row', 'ms-2'])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<TimelineSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
