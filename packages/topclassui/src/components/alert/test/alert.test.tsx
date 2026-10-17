import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import * as entry from '../index.js'
import { Alert } from '../index.js'
import { ALERT_VARIANTS } from '../constants.js'
import type { AlertProps } from '../types.js'

const html = (props: AlertProps = {}) => markup(<Alert title="Saved" {...props}>All changes are stored.</Alert>)
const classes = (props: AlertProps = {}) => classList(html(props))

/**
 * What each variant alone paints at the default tone. Anything in another row and not
 * in its own must be absent, so a variant cannot quietly emit nothing.
 */
const MARKS: Record<string, string[]> = {
  soft: ['bg-info-soft', 'text-info-on-soft', 'border-transparent'],
  solid: ['bg-info-solid', 'text-info-on-solid', 'border-transparent'],
  outline: ['text-info-on-soft', 'border-current'],
}

describe('the element it renders', () => {
  it('is a div, so the description may hold paragraphs and lists', () => {
    expect(html()).toMatch(/^<div /)
  })

  it('has no role, because it is page content and not a live region', () => {
    expect(html()).not.toContain('role=')
    expect(html()).not.toContain('aria-live')
  })

  it('becomes a live region only when the caller passes the role', () => {
    expect(attr(markup(<Alert role="alert">Declined</Alert>), 'role')).toBe('alert')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Alert id="trial" data-testid="x" aria-describedby="help">Ends soon</Alert>)
    expect(html_).toMatch(/^<div [^>]*id="trial"/)
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'aria-describedby')).toBe('help')
  })

  it('passes style through to the root', () => {
    expect(html({ style: { opacity: 0.5 } })).toMatch(/^<div [^>]*style="opacity:0.5"/)
  })

  it('exports one component: Callout in the catalog row is a second name, not a second part', () => {
    expect(Object.keys(entry).sort()).toEqual(['Alert', 'alertVariants'])
  })
})

describe('the design attributes', () => {
  it('reports its variant and tone, which the docs and tests read', () => {
    const html_ = html({ variant: 'outline', tone: 'danger' })
    expect(attr(html_, 'data-variant')).toBe('outline')
    expect(attr(html_, 'data-tone')).toBe('danger')
  })

  it('defaults to soft and info, which the docs playground selects', () => {
    const html_ = html()
    expect(attr(html_, 'data-variant')).toBe('soft')
    expect(attr(html_, 'data-tone')).toBe('info')
  })

  it('carries no data-size, because an alert has one size', () => {
    expect(html()).not.toContain('data-size')
  })

  it('carries no state attribute, because an alert has no states', () => {
    expect(html()).not.toMatch(/data-(state|disabled|loading|open|dismissible)/)
  })
})

describe('every variant paints its own look and no other', () => {
  it('names every variant in the table, so adding one cannot skip coverage', () => {
    expect([...ALERT_VARIANTS].sort()).toEqual(['outline', 'soft', 'solid'])
  })

  for (const [variant, own] of Object.entries(MARKS)) {
    const foreign = [...new Set(Object.entries(MARKS)
      .filter(([name]) => name !== variant)
      .flatMap(([, marks]) => marks))].filter((mark) => !own.includes(mark))

    it(`${variant} emits all of its own classes`, () => {
      const list = classes({ variant: variant as AlertProps['variant'] })
      expect(own.filter((mark) => !list.includes(mark)), variant).toEqual([])
    })

    it(`${variant} emits none that belong to another variant`, () => {
      const list = classes({ variant: variant as AlertProps['variant'] })
      expect(foreign.filter((mark) => list.includes(mark)), variant).toEqual([])
    })
  }

  it('leaves outline with no fill at all', () => {
    expect(classes({ variant: 'outline' }).filter((c) => c.startsWith('bg-'))).toEqual([])
  })
})
