import { describe, expect, it } from 'vitest'

import { SIZES } from './contracts/size.js'
import {
  BORDER, BORDER_STRONG, BORDER_WIDTH, CONTROL_HEIGHT, CONTROL_SIZE, DISABLED, FOCUS_RING,
  HOVER, LOADING, TOGGLE_SIZE, TOUCH_TARGET, TRANSITION,
} from './classes.js'

// Shapes are named here, not derived: a derived expectation shrinks with the constant.
const has = (constant: string, cls: string) => constant.split(' ').includes(cls)

describe('the touch target covers both axes and both pointers (R-5.6-2)', () => {
  for (const cls of [
    'min-h-(--tc-target-min)', 'min-w-(--tc-target-min)',
    'pointer-coarse:min-h-(--tc-target-coarse)', 'pointer-coarse:min-w-(--tc-target-coarse)',
  ]) {
    it(`sets ${cls}`, () => {
      expect(has(TOUCH_TARGET, cls)).toBe(true)
    })
  }

  it('reads px tokens, because SC 2.5.8 is specified in CSS px rather than rem', () => {
    expect(TOUCH_TARGET).not.toMatch(/min-[hw]-\d/)
  })
})

describe('the focus ring paints and survives forced colours (R-5.6-1)', () => {
  for (const cls of [
    'outline-hidden', 'focus-visible:outline-solid',
    'focus-visible:outline-(length:--tc-ring-width)',
    'focus-visible:outline-offset-(length:--tc-ring-offset)',
    'focus-visible:outline-ring',
  ]) {
    it(`sets ${cls}`, () => {
      expect(has(FOCUS_RING, cls)).toBe(true)
    })
  }
})

describe('disabled and loading each carry both halves', () => {
  it('dims and blocks a real control and an element with only data-disabled', () => {
    for (const cls of [
      'disabled:pointer-events-none', 'disabled:opacity-50',
      'data-disabled:pointer-events-none', 'data-disabled:opacity-50',
    ]) expect(has(DISABLED, cls), cls).toBe(true)
  })

  it('keeps a loading control at full colour, shows progress and blocks clicks', () => {
    for (const cls of [
      'aria-busy:cursor-progress', 'aria-busy:opacity-100', 'data-loading:pointer-events-none',
    ]) expect(has(LOADING, cls), cls).toBe(true)
  })
})

describe('the size maps cover the scale and read the knobs', () => {
  const real = SIZES.filter((s) => s !== 'custom')

  it('names every size, and only custom emits nothing', () => {
    for (const map of [CONTROL_SIZE, CONTROL_HEIGHT, TOGGLE_SIZE]) {
      expect(Object.keys(map).sort()).toEqual([...SIZES].sort())
      expect(map.custom).toBe('')
    }
  })

  for (const size of real) {
    it(`${size} carries a height, inline padding and a type step`, () => {
      expect(has(CONTROL_SIZE[size], `h-control-${size}`)).toBe(true)
      expect(has(CONTROL_SIZE[size], `px-pad-x-${size}`)).toBe(true)
      expect(CONTROL_SIZE[size].split(' ').filter((c) => /^text-/.test(c))).toHaveLength(1)
    })

    it(`${size} keeps CONTROL_HEIGHT as the one source of its height`, () => {
      expect(CONTROL_HEIGHT[size]).toBe(`h-control-${size}`)
      expect(has(CONTROL_SIZE[size], CONTROL_HEIGHT[size])).toBe(true)
    })
  }
})

describe('the border constants hold the box size apart from the colour', () => {
  it('keeps the width on its own, so a filled control reserves the same box', () => {
    expect(BORDER_WIDTH).toBe('border-(length:--tc-line-width)')
  })

  it('builds both named borders on that width', () => {
    expect(has(BORDER, BORDER_WIDTH)).toBe(true)
    expect(has(BORDER_STRONG, BORDER_WIDTH)).toBe(true)
    expect(has(BORDER, 'border-line')).toBe(true)
    expect(has(BORDER_STRONG, 'border-line-strong')).toBe(true)
  })
})

describe('hover and active read the tone variables, never a colour', () => {
  for (const [variant, value] of Object.entries(HOVER)) {
    it(`${variant} names no fixed colour`, () => {
      expect(value).not.toMatch(/bg-(?!\()/)
    })
  }

  it('routes the transition through the motion knob', () => {
    expect(has(TRANSITION, 'duration-(--tc-duration)')).toBe(true)
    expect(TRANSITION).not.toMatch(/duration-\d/)
  })
})
