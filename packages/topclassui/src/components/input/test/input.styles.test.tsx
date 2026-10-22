import { describe, expect, it } from 'vitest'

import {
  BORDER_STRONG, CONTAIN, CONTROL_SIZE, DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'
import { attr, classList, markup } from '#test/markup.js'
import { INPUT_SIZES } from '../constants.js'
import { Input, inputVariants } from '../index.js'
import type { InputProps } from '../types.js'

const html = (props: Partial<InputProps> = {}) => markup(<Input aria-label="Email" {...props} />)
const classes = (props: Partial<InputProps> = {}) => classList(html(props))

/** Written out, so collapsing two sizes onto one type step is a failure. */
const TYPE_STEP = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base' } as const

describe('size', () => {
  it('offers the shared six', () => {
    expect(INPUT_SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
  })

  for (const size of INPUT_SIZES) {
    it(`${size} emits a height, inline padding and a type step, not only a height`, () => {
      const list = classes({ size })
      if (size === 'custom') return
      // Named independently of CONTROL_SIZE, or dropping a class drops the expectation too.
      expect(list, size).toContain(`h-control-${size}`)
      expect(list, size).toContain(`px-pad-x-${size}`)
      expect(list, size).toContain(TYPE_STEP[size])
    })

    it(`${size} emits no other size's height, padding or type step`, () => {
      const list = classes({ size })
      const foreign = INPUT_SIZES
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
    const list = classes({ size: 'custom' })
    expect(list.filter((c) => /^(h-control-|px-pad-x-|text-(xs|sm|base)$)/.test(c))).toEqual([])
  })

  it('custom still keeps the touch floor, the border and the ring', () => {
    const list = classes({ size: 'custom' })
    expect(list).toContain('min-h-[var(--tc-target-min,24px)]')
    expect(list).toContain('border-line-strong')
    expect(list).toContain('focus-visible:outline-solid')
  })
})

describe('the box', () => {
  it('is a raised surface with body text and the control radius', () => {
    const list = classes()
    expect(list).toContain('bg-surface-raised')
    expect(list).toContain('text-body')
    expect(list).toContain('rounded-control')
  })

  it('paints the placeholder in the muted colour', () => {
    expect(classes()).toContain('placeholder:text-muted')
  })

  it('draws the strong line, because a control boundary must reach 3:1', () => {
    const list = classes()
    expect(list).toContain('border-(length:--tc-line-width)')
    expect(list).toContain('border-line-strong')
    expect(list).not.toContain('border-line')
  })

  it('turns the border to danger through aria-invalid, in every state of the prop', () => {
    // Always present: the attribute switches it on, so a Field's own aria-invalid paints too.
    expect(classes()).toContain('aria-invalid:border-danger-solid')
    expect(classes({ invalid: true })).toContain('aria-invalid:border-danger-solid')
  })

  it('never names a palette colour or a physical side', () => {
    for (const size of INPUT_SIZES) {
      const all = classes({ size, invalid: true, fullWidth: true }).join(' ')
      expect(all, size).not.toMatch(/-(red|violet|slate|gray|zinc|neutral)-\d/)
      expect(all, size).not.toMatch(/(^| )(pl|pr|ml|mr|left|right)-/)
    }
  })
})

describe('fullWidth', () => {
  it('stretches only when asked', () => {
    expect(classes({ fullWidth: true })).toContain('w-full')
    expect(classes()).not.toContain('w-full')
  })

  it('never reaches the DOM as an attribute', () => {
    expect(html({ fullWidth: true })).not.toMatch(/fullwidth/i)
  })
})

describe('className', () => {
  it('keeps a consumer utility', () => {
    expect(classes({ className: 'mt-4' })).toContain('mt-4')
  })

  it('lets the consumer win a conflict, which is what cn() is for', () => {
    const list = classes({ className: 'bg-surface' })
    expect(list).toContain('bg-surface')
    expect(list).not.toContain('bg-surface-raised')
  })

  it('lets the consumer override the size', () => {
    const list = classes({ size: 'md', className: 'h-control-xl' })
    expect(list).toContain('h-control-xl')
    expect(list).not.toContain('h-control-md')
  })
})

describe('the shared class constants are used whole, not spot-copied', () => {
  const SHARED = { BORDER_STRONG, CONTAIN, DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION }

  for (const [name, constant] of Object.entries(SHARED)) {
    it(`carries every class of ${name}`, () => {
      const list = classes()
      const wanted = constant.split(' ').filter(Boolean)
      expect(wanted.length, name).toBeGreaterThan(0)
      expect(wanted.filter((c) => !list.includes(c)), name).toEqual([])
    })
  }

  it('dims and shows not-allowed when disabled, through the native attribute', () => {
    const list = classes({ disabled: true })
    expect(list).toContain('disabled:opacity-50')
    expect(list).toContain('disabled:cursor-not-allowed')
    expect(list).not.toContain('disabled:pointer-events-none')
  })

  it('never outgrows its container, even at its own width', () => {
    expect(classes()).toContain('max-w-full')
  })
})

describe('inputVariants', () => {
  it('is the class string the component wears', () => {
    expect(inputVariants({ size: 'lg', fullWidth: true }).split(' ').sort())
      .toEqual(classes({ size: 'lg', fullWidth: true }).sort())
  })

  it('falls back to the defaults', () => {
    expect(inputVariants().split(' ')).toContain('h-control-md')
    expect(inputVariants().split(' ')).not.toContain('w-full')
  })

  it('appends a className, and lets it win', () => {
    const out = inputVariants({ className: 'h-control-xl' }).split(' ')
    expect(out).toContain('h-control-xl')
    expect(out).not.toContain('h-control-md')
  })
})
