import { describe, expect, it } from 'vitest'

import { CONTROL_HEIGHT } from '#shared/classes.js'
import { attr, classList, markup } from '#test/markup.js'
import { BUTTON_DEFAULTS, BUTTON_SIZES } from '../constants.js'
import { ButtonSkeleton } from '../skeleton.js'

const classes = (...args: Parameters<typeof ButtonSkeleton>) =>
  classList(markup(<ButtonSkeleton {...args[0]} />))

describe('ButtonSkeleton', () => {
  it('is hidden from the accessibility tree', () => {
    expect(markup(<ButtonSkeleton />)).toContain('aria-hidden="true"')
  })

  for (const size of BUTTON_SIZES) {
    it(`${size} is the control height itself, read from CONTROL_HEIGHT`, () => {
      const height = CONTROL_HEIGHT[size]
      const list = classes({ size })
      expect(list.filter((c) => c.startsWith('h-')), size).toEqual(height === '' ? [] : [height])
    })
  }

  it('reserves a width at every real size, or it reserves no space at all', () => {
    for (const size of BUTTON_SIZES) {
      const widths = classes({ size }).filter((c) => /^w-\d/.test(c))
      expect(widths.length, size).toBe(size === 'custom' ? 0 : 1)
    }
  })

  it('starts at the same default size as the control it stands in for', () => {
    expect(classes({})).toEqual(classes({ size: BUTTON_DEFAULTS.size }))
  })

  it('wears the same box as the control: the radius knob and a surface fill', () => {
    const list = classes({})
    expect(list).toContain('rounded-control')
    expect(list).toContain('bg-surface')
  })

  it('stretches when the button it stands in for does', () => {
    expect(classes({ fullWidth: true })).toContain('w-full')
  })

  it('respects reduced motion', () => {
    expect(classes({})).toContain('motion-reduce:animate-none')
  })

  it('passes className, style and the rest through, as every component must', () => {
    const html = markup(<ButtonSkeleton className="mt-4" id="s" data-testid="x" />)
    expect(attr(html, 'class')).toContain('mt-4')
    expect(attr(html, 'id')).toBe('s')
    expect(attr(html, 'data-testid')).toBe('x')
  })
})
