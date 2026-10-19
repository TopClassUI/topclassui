import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Button } from '../index.js'
import { BUTTON_VARIANTS } from '../constants.js'
import { BUTTON_DEFAULTS } from '../constants.js'
import type { ButtonProps } from '../types.js'

const html = (props: ButtonProps = {}) => markup(<Button {...props}>Save</Button>)
const classes = (props: ButtonProps = {}) => classList(html(props))

/**
 * What each variant alone is allowed to paint. Anything in another variant's row
 * and not in its own must be absent, so a variant cannot quietly emit nothing.
 */
const MARKS: Record<string, string[]> = {
  solid: ['border-transparent', 'bg-primary-solid', 'text-primary-on-solid', 'hover:bg-(--tc-hover)', 'active:bg-(--tc-active)'],
  soft: ['border-transparent', 'bg-primary-soft', 'text-primary-on-soft', 'hover:bg-(--tc-soft-hover)', 'active:bg-(--tc-soft-active)'],
  outline: ['border-line-strong', 'text-body', 'hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'],
  ghost: ['border-transparent', 'text-body', 'hover:bg-(--tc-soft)', 'active:bg-(--tc-soft-hover)'],
  link: ['border-transparent', 'text-primary-on-soft', 'underline-offset-4', 'hover:underline'],
}

describe('the element it renders', () => {
  it('is a button with an explicit type, so it never submits a form by accident', () => {
    expect(html()).toMatch(/^<button type="button"/)
  })

  it('takes a different type when asked', () => {
    expect(attr(html({ type: 'submit' }), 'type')).toBe('submit')
  })

  it('renders its children', () => {
    expect(html()).toContain('Save')
  })

  it('spreads the rest onto the root', () => {
    const html_ = html({ 'data-testid': 'x', id: 'save' } as ButtonProps)
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'id')).toBe('save')
  })

  it('passes style through, which R-5.2-5 makes the channel for a --tc-* knob', () => {
    const styled = html({ style: { '--tc-radius': '0px' } })
    expect(attr(styled, 'style')).toBe('--tc-radius:0px')
  })
})

describe('the design attributes', () => {
  it('reports its variant, tone and size, which the docs and tests read', () => {
    const html_ = html({ variant: 'soft', tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-variant')).toBe('soft')
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('reports the defaults when nothing is passed', () => {
    const html_ = html()
    expect(attr(html_, 'data-variant')).toBe(BUTTON_DEFAULTS.variant)
    expect(attr(html_, 'data-tone')).toBe(BUTTON_DEFAULTS.tone)
    expect(attr(html_, 'data-size')).toBe(BUTTON_DEFAULTS.size)
  })

  it('uses presence attributes, never data-state', () => {
    expect(html({ loading: true })).not.toContain('data-state')
    expect(attr(html({ loading: true }), 'data-loading')).toBe('')
  })
})

describe('every variant paints its own look and no other', () => {
  it('names every variant in the table, so adding one cannot skip coverage', () => {
    expect(Object.keys(MARKS).sort()).toEqual([...BUTTON_VARIANTS].sort())
  })

  for (const variant of BUTTON_VARIANTS) {
    const own = MARKS[variant] ?? []
    const foreign = [...new Set(Object.entries(MARKS)
      .filter(([name]) => name !== variant)
      .flatMap(([, marks]) => marks))].filter((mark) => !own.includes(mark))

    it(`${variant} emits all of its own classes`, () => {
      const list = classes({ variant })
      expect(own.filter((mark) => !list.includes(mark)), variant).toEqual([])
    })

    it(`${variant} emits none that belong to another variant`, () => {
      const list = classes({ variant })
      expect(foreign.filter((mark) => list.includes(mark)), variant).toEqual([])
    })
  }

  it('leaves ghost and link with no fill at rest', () => {
    for (const variant of ['ghost', 'link'] as const) {
      expect(classes({ variant }).filter((c) => /^bg-(?!\()/.test(c)), variant).toEqual([])
    }
  })
})
