import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { TimelineSkeleton } from '../index.js'
import type { TimelineSkeletonProps } from '../types.js'

const html = (props: TimelineSkeletonProps = {}) => markup(<TimelineSkeleton {...props} />)

describe('TimelineSkeleton', () => {
  it('draws three rows of a 12 px dot and a bar, in the skeleton fill and pulse', () => {
    const out = html()
    expect(out.match(/class="block size-3 shrink-0 rounded-full bg-neutral-soft animate-pulse/g)).toHaveLength(3)
    expect([...out.matchAll(/class="block h-2\.5 rounded-chip [^"]* (w-\d+)"/g)].map((m) => m[1])).toEqual(['w-36', 'w-48', 'w-28'])
  })

  it('stops the pulse under reduced motion and keeps a line under forced colours', () => {
    expect(html()).toContain('motion-reduce:animate-none forced-colors:outline-(length:--tc-line-width)')
  })

  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as TimelineSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('passes className last, so the caller wins a conflict', () => {
    expect(classList(html({ className: 'gap-2' }))).toEqual(['flex', 'flex-col', 'gap-2'])
  })
})
