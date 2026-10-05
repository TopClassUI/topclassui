import { describe, expect, it } from 'vitest'

import { spinner } from '#icons/data/spinner.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { Button } from '../index.js'
import type { ButtonProps } from '../types.js'

const html = (props: ButtonProps = {}) => markup(<Button {...props}>Save</Button>)
const classes = (props: ButtonProps = {}) => classList(html(props))

describe('loading', () => {
  const busy = html({ loading: true })

  it('renders the spinner icon itself, not merely something that spins', () => {
    const expected = markup(<Svg icon={spinner} className="animate-spin motion-reduce:animate-none" />)
    expect(busy).toContain(expected)
  })

  it('puts the spinner before the label, which is what mirrors in RTL', () => {
    expect(busy.indexOf('<svg')).toBeLessThan(busy.indexOf('Save'))
  })

  it('respects reduced motion, so the spinner does not spin for everyone', () => {
    expect(busy).toContain('motion-reduce:animate-none')
  })

  it('marks itself busy and stops taking clicks', () => {
    expect(attr(busy, 'aria-busy')).toBe('true')
    expect(busy).toContain('disabled=""')
    expect(classes({ loading: true })).toContain('data-loading:pointer-events-none')
  })

  it('shows the busy cursor, so the pointer says the same thing as aria-busy', () => {
    expect(classes({ loading: true })).toContain('aria-busy:cursor-progress')
  })

  it('keeps full colour, so it never reads as disabled', () => {
    expect(classes({ loading: true })).toContain('aria-busy:opacity-100')
    expect(attr(busy, 'data-disabled')).toBeUndefined()
  })

  it('hides the spinner from the accessibility tree, since aria-busy says it already', () => {
    expect(busy).toContain('aria-hidden="true"')
  })

  it('renders no spinner and no busy state when it is not loading', () => {
    expect(html()).not.toContain('<svg')
    expect(attr(html(), 'aria-busy')).toBeUndefined()
    expect(attr(html(), 'data-loading')).toBeUndefined()
  })
})

describe('disabled', () => {
  it('sets both the attribute and the presence flag', () => {
    expect(html({ disabled: true })).toContain('disabled=""')
    expect(attr(html({ disabled: true }), 'data-disabled')).toBe('')
  })

  it('stays enabled when neither disabled nor loading', () => {
    expect(attr(html(), 'disabled')).toBeUndefined()
    expect(attr(html(), 'data-disabled')).toBeUndefined()
  })

  it('cannot be re-enabled while loading, which PLAN 8.4 spells with ||', () => {
    expect(html({ disabled: false, loading: true })).toContain('disabled=""')
  })

  it('is actually dimmed and stops taking pointer events, both ways', () => {
    const list = classes({ disabled: true })
    for (const cls of [
      'disabled:opacity-50', 'disabled:pointer-events-none',
      'data-disabled:opacity-50', 'data-disabled:pointer-events-none',
    ]) expect(list, cls).toContain(cls)
  })
})

describe('an element that is not a button', () => {
  // Narrowed on purpose: the type now refuses button-only attributes on an anchor.
  const link = (props: { disabled?: boolean; loading?: boolean } = {}) =>
    markup(<Button render={<a href="/x" />} {...props}>Go</Button>)

  it('gets the ARIA pair instead of a disabled attribute, which an anchor has not', () => {
    const html_ = link({ disabled: true })
    expect(attr(html_, 'disabled')).toBeUndefined()
    expect(attr(html_, 'aria-disabled')).toBe('true')
    expect(attr(html_, 'tabindex')).toBe('-1')
  })

  it('is taken out of the tab order while loading too', () => {
    expect(attr(link({ loading: true }), 'aria-disabled')).toBe('true')
    expect(attr(link({ loading: true }), 'tabindex')).toBe('-1')
  })

  it('is left alone when it is usable', () => {
    expect(link()).not.toContain('aria-disabled')
    expect(link()).not.toContain('tabindex')
  })

  it('never carries a button type, which is invalid on an anchor', () => {
    expect(link()).not.toContain('type="button"')
  })

  it('still gets the button type when the rendered element is a button', () => {
    expect(attr(markup(<Button render={<button />}>Go</Button>), 'type')).toBe('button')
  })
})
