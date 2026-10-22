import { describe, expect, it } from 'vitest'

import { SIZES } from './contracts/size.js'
import {
  BORDER, BORDER_STRONG, BORDER_WIDTH, CONTROL_HEIGHT, CONTROL_SIZE, DISABLED, FOCUS_RING,
  FORCED_EDGE, HOVER, KNOB_SIZE, LOADING, TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_RING, TOGGLE_SIZE, TOGGLE_TARGET,
  TOUCH_TARGET, TRANSITION,
} from './classes.js'

// Shapes are named here, not derived: a derived expectation shrinks with the constant.
const has = (constant: string, cls: string) => constant.split(' ').includes(cls)

describe('the touch target covers both axes and both pointers (R-5.6-2)', () => {
  for (const cls of [
    'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
    'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
    'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
  ]) {
    it(`sets ${cls}`, () => {
      expect(has(TOUCH_TARGET, cls)).toBe(true)
    })
  }

  it('reads px tokens, because SC 2.5.8 is specified in CSS px rather than rem', () => {
    expect(TOUCH_TARGET).not.toMatch(/min-[hw]-\d/)
  })

  it('carries a px fallback, so a consumer token file cannot remove the floor', () => {
    expect(TOUCH_TARGET.split(' ').filter((c) => c.includes(',24px'))).toHaveLength(2)
    expect(TOUCH_TARGET.split(' ').filter((c) => c.includes(',44px'))).toHaveLength(2)
  })
})

describe('the focus ring paints on focus and nothing at rest (R-5.6-1)', () => {
  for (const cls of [
    'outline-none', 'focus-visible:outline-solid',
    'focus-visible:outline-(length:--tc-ring-width)',
    'focus-visible:outline-offset-(length:--tc-ring-offset)',
    'focus-visible:outline-ring',
  ]) {
    it(`sets ${cls}`, () => {
      expect(has(FOCUS_RING, cls)).toBe(true)
    })
  }

  // Tailwind's outline-hidden is a 2px transparent outline under forced colours, which paints it.
  it('never resets with outline-hidden, which rings every control at rest under forced colours', () => {
    expect(has(FOCUS_RING, 'outline-hidden')).toBe(false)
  })

  it('is those five classes and no sixth', () => {
    expect(FOCUS_RING.split(' ')).toHaveLength(5)
  })
})

describe('the line forced colours leave of a shape drawn by its fill alone', () => {
  it('is one outline at the line width, behind forced-colors and nowhere else', () => {
    expect(FORCED_EDGE).toBe('forced-colors:outline-(length:--tc-line-width)')
  })
})

describe('disabled and loading each carry both halves', () => {
  it('dims a real control and an element with only data-disabled, and shows not-allowed on both', () => {
    for (const cls of [
      'disabled:opacity-50', 'disabled:cursor-not-allowed',
      'data-disabled:opacity-50', 'data-disabled:cursor-not-allowed',
    ]) expect(has(DISABLED, cls), cls).toBe(true)
  })

  it('keeps the pointer events of a disabled control, or its not-allowed cursor could never paint', () => {
    expect(DISABLED).not.toContain('pointer-events')
  })

  it('keeps a loading control at full colour, shows progress and blocks clicks', () => {
    for (const cls of [
      'aria-busy:opacity-100', 'data-loading:pointer-events-none',
    ]) expect(has(LOADING, cls), cls).toBe(true)
  })
})

describe('the size maps cover the scale and read the knobs', () => {
  const real = SIZES.filter((s) => s !== 'custom')

  it('names every size, and only custom emits nothing', () => {
    for (const map of [CONTROL_SIZE, CONTROL_HEIGHT, TOGGLE_SIZE, KNOB_SIZE]) {
      expect(Object.keys(map).sort()).toEqual([...SIZES].sort())
      expect(map.custom).toBe('')
    }
  })

  /** The scale, written out, so collapsing two steps into one is a failure. */
  const TYPE_STEP = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const

  it('gives the scale three distinct type steps, not one repeated', () => {
    expect(new Set(Object.values(TYPE_STEP)).size).toBe(3)
  })

  for (const size of real) {
    it(`${size} is the square toggle box of its own name`, () => {
      expect(TOGGLE_SIZE[size]).toBe(`size-toggle-${size}`)
    })

    it(`${size} is the slider knob of its own name`, () => {
      expect(KNOB_SIZE[size]).toBe(`size-knob-${size}`)
    })

    it(`${size} carries the type step the scale names for it`, () => {
      expect(has(CONTROL_SIZE[size], TYPE_STEP[size])).toBe(true)
    })

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

  it('animates the properties a tone, a state and a press actually change', () => {
    // Named, not derived: TRANSITION.split(' ') would shrink with the constant.
    expect(has(TRANSITION, 'transition-[color,background-color,border-color,outline-color,opacity,translate]')).toBe(true)
    expect(has(TRANSITION, 'ease-out')).toBe(true)
    expect(TRANSITION).not.toContain('transition-none')
  })
})

describe('a toggle: the target takes the press, the box inside it draws the rest', () => {
  it('makes the target a named group, a 24 px floor that grows to 44 under a coarse pointer, and dims it disabled', () => {
    for (const cls of [
      'group/toggle', 'inline-flex', 'items-center', 'justify-center', 'outline-none',
      'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'disabled:opacity-50', 'data-disabled:opacity-50',
    ]) expect(has(TOGGLE_TARGET, cls), cls).toBe(true)
  })

  it('sizes the target to its content, so laid straight into a grid it does not fill the track', () => {
    expect(has(TOGGLE_TARGET, 'w-fit')).toBe(true)
  })

  it('draws the ring on the box and none on the target, which a 44 px finger target would make too wide', () => {
    expect(TOGGLE_RING.split(' ')).toEqual([
      'group-focus-visible/toggle:outline-solid', 'group-focus-visible/toggle:outline-(length:--tc-ring-width)',
      'group-focus-visible/toggle:outline-offset-(length:--tc-ring-offset)', 'group-focus-visible/toggle:outline-ring',
      'forced-colors:group-focus-visible/toggle:outline-[CanvasText]',
    ])
    for (const cls of TOGGLE_RING.split(' ')) expect(has(TOGGLE_BOX, cls), cls).toBe(true)
    expect(TOGGLE_TARGET).not.toContain('focus-visible')
  })

  it('reads every state through the named group, never a bare one an accordion trigger around it would match', () => {
    for (const constant of [TOGGLE_RING, TOGGLE_ON, TOGGLE_INVALID]) expect(constant).not.toMatch(/(^|[\s:])group-[a-z-]+:/)
  })

  it('gives the box its 3:1 line and its motion, and no fill and no justify a part would have to override', () => {
    for (const cls of ['inline-flex', 'shrink-0', 'items-center', 'border-line-strong', 'duration-(--tc-duration)']) expect(has(TOGGLE_BOX, cls), cls).toBe(true)
    expect(TOGGLE_BOX).not.toMatch(/(^|\s)(bg|justify)-/)
  })

  it('fills a checked box, and under forced colours paints it the system pair itself', () => {
    for (const cls of [
      'group-data-checked/toggle:bg-primary-solid', 'group-data-checked/toggle:border-primary-solid',
      'group-data-checked/toggle:text-primary-on-solid', 'forced-colors:group-data-checked/toggle:forced-color-adjust-none',
      'forced-colors:group-data-checked/toggle:bg-[Highlight]', 'forced-colors:group-data-checked/toggle:border-[Highlight]',
      'forced-colors:group-data-checked/toggle:text-[HighlightText]',
    ]) expect(has(TOGGLE_ON, cls), cls).toBe(true)
  })

  it('turns an invalid line red and thicker, and red still when it is checked too', () => {
    for (const cls of [
      'group-aria-invalid/toggle:border-danger-solid', 'group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid',
      'group-aria-invalid/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]',
      'group-aria-invalid/toggle:inset-ring-danger-solid', 'forced-colors:group-aria-invalid/toggle:border-(length:--tc-ring-width)',
    ]) expect(has(TOGGLE_INVALID, cls), cls).toBe(true)
  })

  it('under forced colours, where a checked box keeps author colours, paints invalid CanvasText and disabled GrayText', () => {
    for (const cls of ['forced-colors:group-aria-invalid/toggle:group-data-checked/toggle:border-[CanvasText]', 'forced-colors:group-aria-invalid/toggle:inset-ring-0']) {
      expect(has(TOGGLE_INVALID, cls), cls).toBe(true)
    }
    for (const cls of ['forced-colors:group-disabled/toggle:group-data-checked/toggle:border-[GrayText]', 'forced-colors:group-disabled/toggle:group-data-checked/toggle:bg-[GrayText]']) {
      expect(has(TOGGLE_ON, cls), cls).toBe(true)
    }
  })
})
