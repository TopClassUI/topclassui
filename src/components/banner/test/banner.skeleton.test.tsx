import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Banner } from '../index.js'
import { BannerSkeleton } from '../skeleton.js'
import type { BannerSkeletonProps } from '../types.js'

const html = (props: BannerSkeletonProps = {}) => markup(<BannerSkeleton {...props} />)
const classes = (props: BannerSkeletonProps = {}) => classList(html(props))
const spans = (out: string) => [...out.matchAll(/<span class="([^"]*)"><\/span>/g)].map((m) => (m[1] ?? '').split(' ').sort())

/** Every class that decides the banner's height and its flow, written out. */
const BOX = ['flex', 'flex-wrap', 'forced-colors:border-b-(length:--tc-line-width)', 'gap-3', 'items-center', 'min-w-0', 'px-5', 'py-3', 'text-sm', 'w-full']

const PULSE = ['animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'motion-reduce:animate-none']

const BAR = [...PULSE, 'block', 'h-[1em]', 'max-w-80', 'my-[calc((1lh-1em)/2)]', 'rounded-chip', 'w-full'].sort()

const DISMISS = [
  ...PULSE, 'inline-flex', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]', 'ms-auto',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
  'rounded-control', 'shrink-0',
].sort()

describe('BannerSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as BannerSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('is no landmark and holds no button: nothing in it can be reached', () => {
    expect(html({ dismissible: true })).not.toMatch(/role=|<button|tabindex|href/)
  })

  it('carries the banner box, the classes that set its height, on the plain surface', () => {
    const list = classes()
    expect([...BOX, 'bg-surface'].filter((c) => !list.includes(c))).toEqual([])
  })

  it('reserves the same box classes the banner itself emits', () => {
    const banner = classList(markup(<Banner aria-label="x">Hi</Banner>))
    expect(BOX.filter((c) => !banner.includes(c))).toEqual([])
  })

  it('holds one bar where the message goes, and no x unless it is dismissible, as Banner defaults', () => {
    expect(spans(html())).toEqual([BAR])
    expect(html()).toBe(html({ dismissible: false }))
  })

  it('dismissible: the box of the x after the bar, with the floor of a button under every pointer', () => {
    expect(spans(html({ dismissible: true }))).toEqual([BAR, DISMISS])
  })

  it('lets the consumer className win a conflict, because it is passed last', () => {
    const list = classes({ className: 'bg-page px-3' })
    expect(list).toContain('bg-page')
    expect(list).toContain('px-3')
    expect(list).not.toContain('bg-surface')
    expect(list).not.toContain('px-5')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<BannerSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(out, 'class')).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
