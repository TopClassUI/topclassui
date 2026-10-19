import { describe, expect, it } from 'vitest'

import {
  FIELD_BOX, FIELD_HOLDER, FIELD_HOLDER_FULL, FIELD_INVALID, FIELD_INVALID_WITHIN, FIELD_LTR, FIELD_OWN_WIDTH,
  FIELD_SIZE, FIELD_SURFACE, FIELD_TEXT, FIELD_TEXT_COARSE, TARGET_HEIGHT,
} from './classes.js'
import { cn } from './cn.js'

// Shapes are named here, not derived: a derived expectation shrinks with the constant.
const list = (constant: string) => constant.split(' ')

describe('a field that is one element', () => {
  it('keeps the strings Input measured: its own width, its forced direction and the 16 px text', () => {
    expect(FIELD_OWN_WIDTH).toBe('w-[min(100%,var(--tc-input-width))]')
    expect(list(FIELD_LTR)).toEqual(['data-ltr:text-match-parent', 'data-ltr:placeholder:[unicode-bidi:plaintext]'])
    expect(FIELD_TEXT_COARSE).toBe('pointer-coarse:text-[max(1rem,16px)]')
  })

  it('turns an invalid line red and thicker, by a ring inside it, and under forced colours by the line itself', () => {
    expect(list(FIELD_INVALID)).toEqual([
      'aria-invalid:border-danger-solid', 'aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',
      'aria-invalid:inset-ring-danger-solid', 'forced-colors:aria-invalid:border-(length:--tc-ring-width)',
    ])
  })

  it('draws the box from the surface, and adds the placeholder colour, the ring, the floor, disabled and invalid', () => {
    for (const cls of [
      ...list(FIELD_SURFACE), 'placeholder:text-muted', 'disabled:opacity-50', 'outline-none', 'focus-visible:outline-solid',
      'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]', ...list(FIELD_INVALID),
    ]) expect(list(FIELD_BOX), cls).toContain(cls)
  })

  it('sizes a one-line field on the control scale, its text 16 px under a coarse pointer at every step, custom at nothing', () => {
    expect(FIELD_SIZE).toEqual({
      xs: 'h-control-xs px-pad-x-xs text-xs pointer-coarse:text-[max(1rem,16px)]',
      sm: 'h-control-sm px-pad-x-sm text-sm pointer-coarse:text-[max(1rem,16px)]',
      md: 'h-control-md px-pad-x-md text-sm pointer-coarse:text-[max(1rem,16px)]',
      lg: 'h-control-lg px-pad-x-lg text-base pointer-coarse:text-[max(1rem,16px)]',
      xl: 'h-control-xl px-pad-x-xl text-base pointer-coarse:text-[max(1rem,16px)]',
      custom: '',
    })
  })
})

describe('the pieces of a field made of more than one element', () => {
  it('a target height alone, with no width floor a shrinking field would have to fight', () => {
    expect(list(TARGET_HEIGHT)).toEqual(['min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'])
  })

  it('a surface with its fill, its 3:1 line, its hover step, its radius and its motion, and no ring and no floor of its own', () => {
    expect(list(FIELD_SURFACE)).toEqual([
      'rounded-control', 'bg-surface-raised', 'text-body', 'border-(length:--tc-line-width)', 'border-line-strong',
      'hover:not-aria-invalid:not-has-aria-invalid:border-body', 'max-w-full',
      'transition-[color,background-color,border-color,outline-color,opacity,translate]', 'duration-(--tc-duration)', 'ease-out',
    ])
  })

  it('a holder of one column that may shrink to nothing and grows to the width of an Input, never wider than its parent', () => {
    expect(list(FIELD_HOLDER)).toEqual(['w-fit', 'max-w-full', 'grid-cols-[minmax(0,var(--tc-input-width))]'])
  })

  it('fullWidth on a holder: cn() drops the fit width and the capped column for the full ones', () => {
    expect(list(FIELD_HOLDER_FULL)).toEqual(['w-full', 'grid-cols-1'])
    expect(cn(FIELD_HOLDER, FIELD_HOLDER_FULL)).toBe('max-w-full w-full grid-cols-1')
  })

  it('marks a box whose field inside it is invalid, as FIELD_INVALID marks the field', () => {
    expect(list(FIELD_INVALID_WITHIN)).toEqual([
      'has-aria-invalid:border-danger-solid', 'has-aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',
      'has-aria-invalid:inset-ring-danger-solid', 'forced-colors:has-aria-invalid:border-(length:--tc-ring-width)',
    ])
  })

  it('gives a wrapper the type step of each size and the 16 px floor on touch at every size, so the em of --tc-input-width is the em of an Input of that size', () => {
    expect(FIELD_TEXT).toEqual({
      xs: 'text-xs pointer-coarse:text-[max(1rem,16px)]',
      sm: 'text-sm pointer-coarse:text-[max(1rem,16px)]',
      md: 'text-sm pointer-coarse:text-[max(1rem,16px)]',
      lg: 'text-base pointer-coarse:text-[max(1rem,16px)]',
      xl: 'text-base pointer-coarse:text-[max(1rem,16px)]',
      custom: '',
    })
  })
})
