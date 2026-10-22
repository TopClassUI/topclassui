import type { ReactNode } from 'react'
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

  it('is actually dimmed and shows not-allowed, both ways', () => {
    const list = classes({ disabled: true })
    for (const cls of [
      'disabled:opacity-50', 'disabled:cursor-not-allowed',
      'data-disabled:opacity-50', 'data-disabled:cursor-not-allowed',
    ]) expect(list, cls).toContain(cls)
  })

  it('keeps its pointer events, so the cursor paints: a native disabled button takes no click of its own', () => {
    // LOADING's data-loading:pointer-events-none stays: a loading button keeps the arrow it always had.
    expect(classes({ disabled: true }).filter((cls) => cls.includes('pointer-events'))).toEqual(['data-loading:pointer-events-none'])
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
    expect(link()).not.toContain('aria-disabled=')
    expect(link()).not.toContain('tabindex')
  })

  it('never carries a button type, which is invalid on an anchor', () => {
    expect(link()).not.toContain('type="button"')
  })

  it('still gets the button type when the rendered element is a button', () => {
    expect(attr(markup(<Button render={<button />}>Go</Button>), 'type')).toBe('button')
  })
})

describe('a disabled anchor cannot still be followed', () => {
  const link = (props: { disabled?: boolean; loading?: boolean } = {}) =>
    markup(<Button render={<a href="/x" />} {...props}>Go</Button>)

  it('drops the href, because pointer-events cannot stop Enter or .click()', () => {
    expect(attr(link({ disabled: true }), 'href')).toBeUndefined()
    expect(attr(link({ loading: true }), 'href')).toBeUndefined()
  })

  it('keeps announcing itself, which an anchor with no href would not', () => {
    expect(attr(link({ disabled: true }), 'role')).toBe('link')
    expect(attr(link({ disabled: true }), 'aria-disabled')).toBe('true')
  })

  it('leaves a usable link alone, href and all', () => {
    expect(attr(link(), 'href')).toBe('/x')
    expect(link()).not.toContain('role=')
  })

  it('keeps the rest of the anchor, so only the href is taken away', () => {
    const html_ = markup(<Button render={<a href="/x" id="go" hrefLang="en" />} disabled>Go</Button>)
    expect(attr(html_, 'id')).toBe('go')
    expect(attr(html_, 'hrefLang')).toBe('en')
  })
})

describe('a disabled component element, such as next/link, keeps its href', () => {
  // A component element, as next/link is: the button cannot strip its href, which the type requires.
  function Link({ href, ...rest }: { href: string, className?: string, children?: ReactNode }) {
    return <a href={href} {...rest} />
  }
  const link = (props: { disabled?: boolean; loading?: boolean } = {}) =>
    markup(<Button render={<Link href="/x" />} {...props}>Go</Button>)

  it('so the pointer is its one stop: it takes no pointer events, and shows its parent\'s cursor rather than not-allowed', () => {
    expect(attr(link({ disabled: true }), 'href')).toBe('/x')
    expect(classList(link({ disabled: true }))).toContain('pointer-events-none')
    expect(classList(link({ loading: true }))).toContain('pointer-events-none')
  })

  it('a usable one, a disabled anchor whose href went and a disabled native button keep their pointer events', () => {
    expect(classList(link())).not.toContain('pointer-events-none')
    expect(classList(markup(<Button render={<a href="/x" />} disabled>Go</Button>))).not.toContain('pointer-events-none')
    expect(classes({ disabled: true })).not.toContain('pointer-events-none')
  })
})
