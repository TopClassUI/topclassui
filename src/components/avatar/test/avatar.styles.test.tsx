import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'
import type { AvatarSize } from '../types.js'

const root = (size?: AvatarSize, className?: string) =>
  classList(markup(<AvatarRoot size={size} className={className}>OA</AvatarRoot>)).sort()
const fallback = (className?: string) =>
  classList(markup(<AvatarFallback className={className}>OA</AvatarFallback>)).sort()
const image = (className?: string) =>
  classList(markup(<AvatarImage src="/a.jpg" alt="Omar Abed" className={className} />)).sort()

/** The Build this block for the root and its forced-colours edge, less the size, sorted and written out. */
const ROOT = [
  'bg-primary-soft', 'font-medium', 'forced-colors:outline-(length:--tc-line-width)', 'inline-flex',
  'items-center', 'justify-center', 'overflow-hidden', 'relative', 'rounded-full', 'shrink-0',
  'text-primary-on-soft',
]

/** The control size on both axes, and the type step CONTROL_SIZE gives that size. */
const SIZE = {
  xs: ['size-control-xs', 'text-xs'],
  sm: ['size-control-sm', 'text-sm'],
  md: ['size-control-md', 'text-sm'],
  lg: ['size-control-lg', 'text-base'],
  xl: ['size-control-xl', 'text-base'],
  custom: [],
} as const

describe('AvatarRoot carries exactly the classes the spec names', () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`${size} emits the root set and its own box, and nothing else`, () => {
      expect(root(size), size).toEqual([...ROOT, ...SIZE[size]].sort())
    })
  }

  it('is md when no size is given', () => {
    expect(root()).toEqual([...ROOT, 'size-control-md', 'text-sm'].sort())
  })

  it('is square: one size class sets both axes, and no height or width class sits beside it', () => {
    expect(root('lg').filter((c) => /^(h|w|min-h|min-w|max-h|max-w)-/.test(c))).toEqual([])
  })

  it('is a circle that clips what it holds, and the context the image is laid over', () => {
    expect(root()).toContain('rounded-full')
    expect(root()).toContain('overflow-hidden')
    expect(root()).toContain('relative')
  })

  it('emits no size class at custom, so className alone sizes it', () => {
    expect(root('custom', 'size-24 text-lg')).toEqual([...ROOT, 'size-24', 'text-lg'].sort())
  })
})

describe('AvatarFallback and AvatarImage', () => {
  it('the fallback centres what it holds and sets no colour or size of its own', () => {
    expect(fallback()).toEqual(['inline-flex', 'items-center', 'justify-center'])
  })

  it('the image is laid over the whole root and cropped to fill it', () => {
    expect(image()).toEqual([
      'absolute', 'forced-color-adjust-none', 'inset-0', 'object-cover', 'size-full', 'text-transparent',
    ])
  })

  it('a failed image cannot print its alt: the text has no colour, and forced colours cannot give it one', () => {
    expect(image().filter((c) => /^text-|^forced-color-adjust-/.test(c))).toEqual(['forced-color-adjust-none', 'text-transparent'])
  })
})

describe('the shape survives forced colours, which remove every fill', () => {
  const skeleton = classList(markup(<AvatarSkeleton />))

  it('the root and its skeleton carry one outline, and only under forced colours', () => {
    expect(root().filter((c) => c.includes('outline'))).toEqual(['forced-colors:outline-(length:--tc-line-width)'])
    expect(skeleton.filter((c) => c.includes('outline'))).toEqual(['forced-colors:outline-(length:--tc-line-width)'])
  })

  it('neither takes a border, which would shrink the picture by its width everywhere else', () => {
    expect([...root(), ...skeleton].filter((c) => /(^|:)border/.test(c))).toEqual([])
  })
})

describe('className is passed last on every part', () => {
  it('AvatarRoot lets every conflicting consumer class replace its own', () => {
    expect(root('md', 'rounded-box size-control-xl text-lg bg-neutral-soft text-neutral-on-soft font-bold')).toEqual([
      'bg-neutral-soft', 'font-bold', 'forced-colors:outline-(length:--tc-line-width)', 'inline-flex',
      'items-center', 'justify-center', 'overflow-hidden', 'relative', 'rounded-box', 'shrink-0',
      'size-control-xl', 'text-lg', 'text-neutral-on-soft',
    ])
  })

  it('AvatarFallback lets a consumer class replace its own', () => {
    expect(fallback('flex items-end')).toEqual(['flex', 'items-end', 'justify-center'])
  })

  it('AvatarImage lets a consumer class replace its own', () => {
    expect(image('object-contain inset-1')).toEqual([
      'absolute', 'forced-color-adjust-none', 'inset-1', 'object-contain', 'size-full', 'text-transparent',
    ])
  })

  it('every part keeps a consumer class that conflicts with nothing', () => {
    expect(root('md', 'ms-2')).toContain('ms-2')
    expect(fallback('ms-2')).toContain('ms-2')
    expect(image('ms-2')).toContain('ms-2')
  })
})

describe('Avatar is not interactive, and names no palette colour', () => {
  const ALL = [...root('md'), ...fallback(), ...image()]

  it('carries no ring, hover, transition, touch target or disabled state', () => {
    const interactive = /^(hover:|active:|focus|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:|cursor-)/
    expect(ALL).toHaveLength(22)
    expect(ALL.filter((c) => interactive.test(c))).toEqual([])
  })

  it('names no palette colour', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    expect(ALL.filter((c) => palette.test(c))).toEqual([])
  })
})
