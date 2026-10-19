import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { AvatarRoot, AvatarSkeleton } from '../index.js'
import type { AvatarSkeletonProps } from '../types.js'

const html = (props: AvatarSkeletonProps = {}) => markup(<AvatarSkeleton {...props} />)
const classes = (props: AvatarSkeletonProps = {}) => classList(html(props)).sort()

/** The circle, the fill Figma binds, the pulse and the forced-colours edge, sorted and written out. */
const SHARED = [
  'animate-pulse', 'bg-neutral-soft', 'forced-colors:outline-(length:--tc-line-width)', 'inline-flex',
  'items-center', 'justify-center', 'motion-reduce:animate-none', 'rounded-full', 'shrink-0',
]

/** The box and the type step of the avatar each one stands in for. */
const BOX = {
  xs: ['size-control-xs', 'text-xs'],
  sm: ['size-control-sm', 'text-xs'],
  md: ['size-control-md', 'text-base'],
  lg: ['size-control-lg', 'text-lg'],
  xl: ['size-control-xl', 'text-xl'],
} as const

describe('AvatarSkeleton', () => {
  it('is the md circle by default, in the placeholder fill, pulsing', () => {
    expect(classes()).toEqual([...SHARED, 'size-control-md', 'text-base'].sort())
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} reserves the box and the type step of an ${size} avatar`, () => {
      expect(classes({ size })).toEqual([...SHARED, ...BOX[size]].sort())
      const root = classList(markup(<AvatarRoot size={size} />))
      for (const name of BOX[size]) expect(root, name).toContain(name)
    })
  }

  it('emits no size class at custom, so className sizes it', () => {
    expect(classes({ size: 'custom' })).toEqual(SHARED)
    expect(classes({ size: 'custom', className: 'size-24' })).toEqual([...SHARED, 'size-24'].sort())
  })

  it('is one span around a non-breaking space, so it has the baseline of initials', () => {
    expect(html()).toMatch(/^<span class="[^"]+" aria-hidden="true">\xa0<\/span>$/)
  })

  it('does not carry the size as an attribute, or a selector for avatars would match it', () => {
    expect(html({ size: 'lg' })).not.toContain('data-size')
  })

  it('is hidden from the accessibility tree, and a caller cannot un-hide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    const forced = { 'aria-hidden': false } as AvatarSkeletonProps
    expect(attr(html(forced), 'aria-hidden')).toBe('true')
  })

  it('lets every conflicting consumer class win, because className is passed last', () => {
    expect(classes({ className: 'rounded-box size-control-xl bg-surface' })).toEqual([
      'animate-pulse', 'bg-surface', 'forced-colors:outline-(length:--tc-line-width)', 'inline-flex',
      'items-center', 'justify-center', 'motion-reduce:animate-none', 'rounded-box', 'shrink-0',
      'size-control-xl', 'text-base',
    ])
  })

  it('passes className, style and the rest through, as every component must', () => {
    const out = markup(<AvatarSkeleton className="ms-2" id="s" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'data-testid')).toBe('x')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })
})
