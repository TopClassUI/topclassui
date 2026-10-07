import { describe, expect, it } from 'vitest'

import {
  BORDER_WIDTH, CONTROL_SIZE, DISABLED, FOCUS_RING, LOADING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { attr, classList, markup } from '#test/markup.js'
import { Button } from '../index.js'
import { BUTTON_SIZES } from '../constants.js'
import type { ButtonProps } from '../types.js'

const html = (props: ButtonProps = {}) => markup(<Button {...props}>Save</Button>)
const classes = (props: ButtonProps = {}) => classList(html(props))

/** Written out, so collapsing two sizes onto one type step is a failure. */
const TYPE_STEP = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const

describe('size', () => {
  for (const size of BUTTON_SIZES) {
    it(`${size} emits a height, inline padding and a type step, not only a height`, () => {
      const list = classes({ size })
      if (size === 'custom') return
      // Named independently of CONTROL_SIZE, or dropping a class drops the expectation too.
      expect(list, size).toContain(`h-control-${size}`)
      expect(list, size).toContain(`px-pad-x-${size}`)
      expect(list, size).toContain(TYPE_STEP[size])
    })

    it(`${size} emits every class CONTROL_SIZE names for it`, () => {
      const list = classes({ size })
      const wanted = CONTROL_SIZE[size].split(' ').filter(Boolean)
      expect(wanted.filter((c) => !list.includes(c)), size).toEqual([])
    })

    it(`${size} emits no other size's height, padding or type step`, () => {
      const list = classes({ size })
      const foreign = BUTTON_SIZES
        .filter((other) => other !== size)
        .flatMap((other) => CONTROL_SIZE[other].split(' ').filter(Boolean))
        .filter((c) => !CONTROL_SIZE[size].includes(c))
      expect([...new Set(foreign)].filter((c) => list.includes(c)), size).toEqual([])
    })

    it(`${size} reports itself on data-size`, () => {
      expect(attr(html({ size }), 'data-size')).toBe(size)
    })
  }

  it('custom opts out of the scale entirely, which is what it is for', () => {
    expect(CONTROL_SIZE.custom).toBe('')
    const list = classes({ size: 'custom' })
    expect(list.filter((c) => /^(h-control-|px-pad-x-|text-(xs|sm|base)$)/.test(c))).toEqual([])
  })
})

describe('the border holds the box size', () => {
  it('always carries the shared width, so switching to outline shifts nothing', () => {
    for (const variant of ['solid', 'soft', 'outline', 'ghost', 'link'] as const) {
      expect(classes({ variant }), variant).toContain(BORDER_WIDTH)
    }
  })

  it('paints a transparent colour unless the variant is outline', () => {
    for (const variant of ['solid', 'soft', 'ghost', 'link'] as const) {
      expect(classes({ variant }), variant).toContain('border-transparent')
    }
    const outline = classes({ variant: 'outline' })
    expect(outline).toContain('border-line-strong')
    expect(outline).not.toContain('border-transparent')
  })
})

describe('fullWidth', () => {
  it('stretches only when asked', () => {
    expect(classes({ fullWidth: true })).toContain('w-full')
    expect(classes()).not.toContain('w-full')
  })
})

describe('className', () => {
  it('keeps a consumer utility', () => {
    expect(classes({ className: 'mt-4' })).toContain('mt-4')
  })

  it('lets the consumer win a conflict, which is what cn() is for', () => {
    const list = classes({ variant: 'solid', className: 'bg-surface' })
    expect(list).toContain('bg-surface')
    expect(list).not.toContain('bg-primary-solid')
  })

  it('lets the consumer override the size', () => {
    const list = classes({ size: 'md', className: 'h-control-xl' })
    expect(list).toContain('h-control-xl')
    expect(list).not.toContain('h-control-md')
  })
})

describe('the shared class constants are used whole, not spot-copied', () => {
  const SHARED = { BORDER_WIDTH, DISABLED, FOCUS_RING, LOADING, TOUCH_TARGET, TRANSITION }

  for (const [name, constant] of Object.entries(SHARED)) {
    it(`carries every class of ${name}`, () => {
      const list = classes()
      const wanted = constant.split(' ').filter(Boolean)
      expect(wanted.length, name).toBeGreaterThan(0)
      expect(wanted.filter((c) => !list.includes(c)), name).toEqual([])
    })
  }

  it('reads the touch target from px tokens, since SC 2.5.8 is written in CSS px', () => {
    expect(TOUCH_TARGET).toContain('--tc-target-min')
    expect(TOUCH_TARGET).toContain('--tc-target-coarse')
  })

  it('reads the transition duration from the motion knob rather than a fixed number', () => {
    expect(classes()).toContain('duration-(--tc-duration)')
  })

  it('reads the radius from the knob rather than naming a Tailwind radius', () => {
    expect(classes()).toContain('rounded-control')
  })

  it('is a centred flex row, which is what puts the spinner beside the label', () => {
    const list = classes()
    for (const cls of ['inline-flex', 'items-center', 'justify-center', 'gap-2']) {
      expect(list, cls).toContain(cls)
    }
  })

  it('keeps the label on one line at its own weight', () => {
    expect(classes()).toContain('whitespace-nowrap')
    expect(classes()).toContain('font-medium')
  })
})
