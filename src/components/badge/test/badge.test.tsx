import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Badge } from '../index.js'
import { BADGE_VARIANTS } from '../constants.js'
import type { BadgeProps } from '../types.js'

const html = (props: BadgeProps = {}) => markup(<Badge {...props}>Paid</Badge>)
const classes = (props: BadgeProps = {}) => classList(html(props))

/**
 * What each variant alone paints at the default tone. Anything in another row and not
 * in its own must be absent, so a variant cannot quietly emit nothing.
 */
const MARKS: Record<string, string[]> = {
  solid: ['bg-primary-solid', 'text-primary-on-solid', 'border-transparent'],
  soft: ['bg-primary-soft', 'text-primary-on-soft', 'border-transparent'],
  outline: ['text-primary-on-soft', 'border-current'],
}

describe('the element it renders', () => {
  it('is a span, so it sits inside a line of text', () => {
    expect(html()).toMatch(/^<span /)
  })

  it('has no role, because the text carries the meaning and colour never does alone', () => {
    expect(html()).not.toContain('role=')
  })

  it('renders its children', () => {
    expect(html()).toContain('Paid')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Badge id="status" data-testid="x" title="Invoice status">Paid</Badge>)
    expect(attr(html_, 'id')).toBe('status')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'title')).toBe('Invoice status')
  })

  it('passes style through to the root', () => {
    expect(attr(html({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })
})

describe('the design attributes', () => {
  it('reports its variant, tone and size, which the docs and tests read', () => {
    const html_ = html({ variant: 'outline', tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-variant')).toBe('outline')
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('defaults to soft, primary and md, which every drawing of a single Badge shows', () => {
    const html_ = html()
    expect(attr(html_, 'data-variant')).toBe('soft')
    expect(attr(html_, 'data-tone')).toBe('primary')
    expect(attr(html_, 'data-size')).toBe('md')
  })

  it('carries no state attribute, because a badge has no states', () => {
    expect(html()).not.toMatch(/data-(state|disabled|loading|open)/)
  })
})

describe('every variant paints its own look and no other', () => {
  it('names every variant in the table, so adding one cannot skip coverage', () => {
    expect(Object.keys(MARKS).sort()).toEqual([...BADGE_VARIANTS].sort())
  })

  for (const variant of BADGE_VARIANTS) {
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

  it('leaves outline with no fill at all', () => {
    expect(classes({ variant: 'outline' }).filter((c) => c.startsWith('bg-'))).toEqual([])
  })
})
