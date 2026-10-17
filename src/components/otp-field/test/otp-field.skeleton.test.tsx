import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { OTPField } from '../index.js'
import { OTPFieldSkeleton } from '../skeleton.js'
import type { OTPFieldSkeletonProps } from '../types.js'

const html = (props: OTPFieldSkeletonProps = {}) => markup(<OTPFieldSkeleton {...props} />)
/** The class list of the outer span, then of each span inside it, cells and separators in order. */
const outer = (props: OTPFieldSkeletonProps = {}) => classList(html(props))
const items = (props: OTPFieldSkeletonProps = {}) => [...html(props).matchAll(/<span class="([^"]*)"><\/span>/g)].map(([, list = '']) => list.split(' '))
const isSeparator = (list: string[]) => list.includes('w-2.5')
const cells = (props: OTPFieldSkeletonProps = {}) => items(props).filter((list) => !isSeparator(list))
/** The shape of the row: c for a cell, | for a separator. */
const shape = (props: OTPFieldSkeletonProps = {}) => items(props).map((list) => (isSeparator(list) ? '|' : 'c')).join('')

type Real = Pick<OTPFieldSkeletonProps, 'length' | 'groupSize' | 'size'>
const real = (props: Real = {}) => markup(<OTPField id="code" {...props} />)
const realRoot = (props: Real = {}) => classList(real(props))
const realCell = (props: Real = {}) => (/<input [^>]*class="([^"]*)"/.exec(real(props))?.[1] ?? '').split(' ')

/** Written out: the most a cell may be at each size, as a square of the control scale, and the coarse cap of the three small ones. */
const CELL = {
  xs: ['h-control-xs', 'max-w-control-xs', 'pointer-coarse:max-w-[var(--tc-target-coarse,44px)]'],
  sm: ['h-control-sm', 'max-w-control-sm', 'pointer-coarse:max-w-[var(--tc-target-coarse,44px)]'],
  md: ['h-control-md', 'max-w-control-md', 'pointer-coarse:max-w-[var(--tc-target-coarse,44px)]'],
  lg: ['h-control-lg', 'max-w-control-lg'],
  xl: ['h-control-xl', 'max-w-control-xl'],
} as const

const FLOOR = ['min-w-[var(--tc-target-min,24px)]', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']
const ROOT = ['flex', 'w-fit', 'min-w-0', 'max-w-full', 'flex-wrap', 'items-center', 'gap-2']
const FIT = ['basis-[var(--tc-target-min,24px)]', 'grow']
const WIDTH = 'w-(--tc-input-width)'

describe('OTPFieldSkeleton', () => {
  it('is hidden from the accessibility tree, and a caller cannot unhide it', () => {
    expect(attr(html(), 'aria-hidden')).toBe('true')
    expect(attr(html({ 'aria-hidden': false } as OTPFieldSkeletonProps), 'aria-hidden')).toBe('true')
  })

  it('renders no input, so nothing in it can take focus: a span around empty spans', () => {
    expect(html()).toMatch(/^<span class="[^"<>]+" aria-hidden="true">(<span class="[^"<>]+"><\/span>)+<\/span>$/)
  })

  it('draws six cells by default, the default length of the field', () => {
    expect(shape()).toBe('cccccc')
  })

  it('draws one cell per length, clamped as the field clamps it: 1 to 12, whole', () => {
    expect([shape({ length: 4 }), shape({ length: 0 }), shape({ length: 99 }), shape({ length: 4.5 })])
      .toEqual(['cccc', 'c', 'cccccccccccc', 'cccc'])
  })

  it('draws a separator after every group, never after the last cell, as the field does', () => {
    expect([shape({ groupSize: 3 }), shape({ groupSize: 2 }), shape({ groupSize: 6 }), shape({ groupSize: 0 })])
      .toEqual(['ccc|ccc', 'cc|cc|cc', 'cccccc', 'cccccc'])
    expect(real({ groupSize: 3 }).match(/<span aria-hidden="true"/g)).toHaveLength(1)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`${size} draws the cell of an ${size} field`, () => {
      for (const name of CELL[size]) {
        expect(cells({ size })[0], name).toContain(name)
        expect(realCell({ size }), name).toContain(name)
      }
      expect(cells({ size })[0]?.filter((c) => c.startsWith('h-'))).toEqual([CELL[size][0]])
    })
  }

  it('starts at md, the default size of the field', () => {
    expect(cells()[0]).toEqual(expect.arrayContaining([...CELL.md]))
  })

  it('emits no size class at custom, so the caller sizes the cells as they size the field', () => {
    expect(cells({ size: 'custom' })[0]?.filter((c) => /^(h-|max-w-|text-|pointer-coarse:(max-w|text)-)/.test(c))).toEqual([])
  })

  it('keeps the floor of a cell, 24 px wide and tall, and 44 tall under a finger', () => {
    for (const name of FLOOR) {
      expect(cells()[0], name).toContain(name)
      expect(realCell(), name).toContain(name)
    }
  })

  it('lays the row out as the field does: as wide as its cells, wrapping in a narrow parent', () => {
    for (const name of ROOT) {
      expect(outer(), name).toContain(name)
      expect(realRoot(), name).toContain(name)
    }
  })

  it('up to eight items, a cell grows from the floor; past eight, it keeps its width and the row breaks at whole cells', () => {
    for (const props of [{}, { groupSize: 2 }] as const) {
      expect(cells(props)[0], 'fit').toEqual(expect.arrayContaining(FIT))
      expect(realCell(props), 'fit').toEqual(expect.arrayContaining(FIT))
    }
    for (const props of [{ length: 12 }, { groupSize: 1 }] as const) {
      expect(cells(props)[0], 'whole').toContain('grow-0')
      expect(cells(props)[0]?.filter((c) => c.startsWith('basis-')), 'whole').toEqual([])
      expect(realCell(props), 'whole').toContain('grow-0')
    }
  })

  it('takes a width past any cell, as an input does, so the max-w of the size is the width', () => {
    for (const props of [{}, { length: 12 }] as const) {
      expect(cells(props)[0]?.filter((c) => c.startsWith('w-'))).toEqual([WIDTH])
    }
  })

  it('wears the radius of a cell and the neutral fill, keeps an edge in forced colours, and pulses unless asked not to', () => {
    // Without animate-pulse, the reduced-motion half passes vacuously: nothing would be animating.
    expect(cells()[0]).toEqual(expect.arrayContaining([
      'rounded-control', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none', 'forced-colors:outline-(length:--tc-line-width)',
    ]))
    expect(realCell()).toContain('rounded-control')
  })

  it('draws the separator as the field does, a 10 x 2 bar, in the same fill', () => {
    const separator = items({ groupSize: 3 })[3]
    expect(separator).toEqual(expect.arrayContaining([
      'h-0.5', 'w-2.5', 'shrink-0', 'rounded-full', 'forced-colors:bg-[CanvasText]', 'bg-neutral-soft', 'animate-pulse', 'motion-reduce:animate-none',
    ]))
    expect(separator).not.toContain('bg-line-strong')
  })

  it('passes className, id, style and the rest to the outer span, as every component must', () => {
    const out = html({ className: 'ms-2', id: 's', style: { ['--tc-x' as string]: '1' }, 'data-testid': 'x' } as OTPFieldSkeletonProps)
    expect(classList(out)).toContain('ms-2')
    expect(attr(out, 'id')).toBe('s')
    expect(attr(out, 'style')).toBe('--tc-x:1')
    expect(attr(out, 'data-testid')).toBe('x')
  })
})
