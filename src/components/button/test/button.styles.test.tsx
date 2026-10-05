import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Button } from '../index.js'
import { BUTTON_SIZES } from '../constants.js'
import { ButtonSkeleton } from '../skeleton.js'
import type { ButtonProps } from '../types.js'

const html = (props: ButtonProps = {}) => renderToStaticMarkup(<Button {...props}>Save</Button>)

/** Anchored, or `id="x"` also matches inside `data-testid="x"`. */
const attr = (markup: string, name: string) =>
  new RegExp(`(?:^|[ ])${name}="([^"]*)"`).exec(markup)?.[1]

const classes = (props: ButtonProps = {}) => (attr(html(props), 'class') ?? '').split(/\s+/)

describe('size', () => {
  for (const size of BUTTON_SIZES) {
    it(`${size} is reported and emits only its own height`, () => {
      const list = classes({ size })
      const heights = list.filter((c) => c.startsWith('h-control-'))
      expect(heights, size).toEqual(size === 'custom' ? [] : [`h-control-${size}`])
    })
  }

  it('custom opts out of the scale entirely, which is what it is for', () => {
    const list = classes({ size: 'custom' })
    expect(list.filter((c) => c.startsWith('h-control-') || c.startsWith('px-pad-x-'))).toEqual([])
  })
})

describe('loading', () => {
  it('shows a spinner, marks itself busy and stops taking clicks', () => {
    const markup = html({ loading: true })
    expect(markup).toContain('animate-spin')
    expect(attr(markup, 'aria-busy')).toBe('true')
    expect(markup).toContain('disabled=""')
  })

  it('respects reduced motion, so the spinner does not spin for everyone', () => {
    expect(html({ loading: true })).toContain('motion-reduce:animate-none')
  })

  it('keeps full colour, so it never reads as disabled', () => {
    expect(classes({ loading: true })).toContain('aria-busy:opacity-100')
  })

  it('hides the spinner from the accessibility tree, since aria-busy says it already', () => {
    expect(html({ loading: true })).toContain('aria-hidden="true"')
  })

  it('is not busy when it is not loading', () => {
    // The class string carries aria-busy: variants, so the attribute is what is asserted.
    expect(attr(html(), 'aria-busy')).toBeUndefined()
    expect(attr(html(), 'data-loading')).toBeUndefined()
  })
})

describe('disabled', () => {
  it('sets both the attribute and the presence flag', () => {
    const markup = html({ disabled: true })
    expect(markup).toContain('disabled=""')
    expect(attr(markup, 'data-disabled')).toBe('')
  })

  it('stays enabled when neither disabled nor loading', () => {
    // Anchored: the class string legitimately contains the text data-disabled:opacity-50.
    expect(attr(html(), 'disabled')).toBeUndefined()
    expect(attr(html(), 'data-disabled')).toBeUndefined()
  })

  it('cannot be re-enabled while loading, which PLAN 8.4 spells with ||', () => {
    expect(html({ disabled: false, loading: true })).toContain('disabled=""')
  })

  it('is actually dimmed and stops taking pointer events', () => {
    const list = classes({ disabled: true })
    expect(list).toContain('data-disabled:opacity-50')
    expect(list).toContain('data-disabled:pointer-events-none')
  })

  it('keeps a loading button at full colour by not marking it disabled for styling', () => {
    expect(attr(html({ loading: true }), 'data-disabled')).toBeUndefined()
    expect(classes({ loading: true })).toContain('aria-busy:opacity-100')
  })

  it('blocks clicks while loading even on an element with no disabled attribute', () => {
    expect(classes({ loading: true })).toContain('data-loading:pointer-events-none')
  })
})

describe('an element that is not a button', () => {
  const link = (props: ButtonProps = {}) =>
    renderToStaticMarkup(<Button render={<a href="/x" />} {...props}>Go</Button>)

  it('gets the ARIA pair instead of a disabled attribute, which an anchor does not have', () => {
    const markup = link({ disabled: true })
    expect(attr(markup, 'disabled')).toBeUndefined()
    expect(attr(markup, 'aria-disabled')).toBe('true')
    expect(attr(markup, 'tabindex')).toBe('-1')
  })

  it('is taken out of the tab order while loading too', () => {
    const markup = link({ loading: true })
    expect(attr(markup, 'aria-disabled')).toBe('true')
    expect(attr(markup, 'tabindex')).toBe('-1')
  })

  it('is left alone when it is usable', () => {
    const markup = link()
    expect(markup).not.toContain('aria-disabled')
    expect(markup).not.toContain('tabindex')
  })

  it('never carries a button type, which is invalid on an anchor', () => {
    expect(link()).not.toContain('type="button"')
  })

  it('still gets the button type when the rendered element is a button', () => {
    const markup = renderToStaticMarkup(<Button render={<button />}>Go</Button>)
    expect(attr(markup, 'type')).toBe('button')
  })
})

describe('the border holds the box size', () => {
  it('keeps the width with a transparent colour, so outline shifts nothing', () => {
    const list = classes()
    expect(list).toContain('border-(length:--tc-line-width)')
    expect(list).toContain('border-transparent')
  })

  it('survives the merge rather than being dropped by a later border colour', () => {
    for (const variant of ['solid', 'soft', 'ghost', 'link'] as const) {
      expect(classes({ variant }), variant).toContain('border-transparent')
    }
  })

  it('outline overrides only the colour', () => {
    const list = classes({ variant: 'outline' })
    expect(list).toContain('border-line-strong')
    expect(list).toContain('border-(length:--tc-line-width)')
    expect(list).not.toContain('border-transparent')
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

describe('the shared class constants are used, not hand-written copies', () => {
  it('carries the focus ring, the touch target and the transition', () => {
    const list = classes()
    expect(list).toContain('outline-hidden')
    expect(list).toContain('focus-visible:outline-solid')
    expect(list).toContain('min-h-6')
    expect(list).toContain('pointer-coarse:min-h-11')
    expect(list.some((c) => c.startsWith('duration-'))).toBe(true)
  })

  it('reads the radius from the knob rather than naming a Tailwind radius', () => {
    expect(classes()).toContain('rounded-control')
  })
})

describe('the render prop', () => {
  it('becomes the element it is given, so a link can look like a button', () => {
    const markup = renderToStaticMarkup(
      <Button render={<a href="/docs" />}>Docs</Button>,
    )
    expect(markup).toMatch(/^<a /)
    expect(attr(markup, 'href')).toBe('/docs')
    expect(markup).toContain('Docs')
  })

  it('still carries the button look and the design attributes', () => {
    const markup = renderToStaticMarkup(<Button render={<a href="/x" />} tone="danger">Go</Button>)
    expect(attr(markup, 'class')).toContain('bg-danger-solid')
    expect(attr(markup, 'data-tone')).toBe('danger')
  })

  it('does not put a button type on something that is not a button', () => {
    expect(renderToStaticMarkup(<Button render={<a href="/x" />}>Go</Button>)).not.toContain('type="button"')
  })

  it('keeps the element its own children when it has them', () => {
    const markup = renderToStaticMarkup(<Button render={<a href="/x">Mine</a>}>Theirs</Button>)
    expect(markup).toContain('Mine')
    expect(markup).not.toContain('Theirs')
  })

  it('merges the element className last, so the consumer still wins', () => {
    const markup = renderToStaticMarkup(<Button render={<a href="/x" className="bg-surface" />}>Go</Button>)
    expect(attr(markup, 'class')).toContain('bg-surface')
    expect(attr(markup, 'class')).not.toContain('bg-primary-solid')
  })
})

describe('ButtonSkeleton', () => {
  it('is hidden from the accessibility tree', () => {
    expect(renderToStaticMarkup(<ButtonSkeleton />)).toContain('aria-hidden="true"')
  })

  it('matches the real control height at every size, so swapping shifts nothing', () => {
    for (const size of BUTTON_SIZES) {
      const markup = renderToStaticMarkup(<ButtonSkeleton size={size} />)
      const list = (attr(markup, 'class') ?? '').split(/\s+/)
      expect(list.filter((c) => c.startsWith('h-control-')), size)
        .toEqual(size === 'custom' ? [] : [`h-control-${size}`])
    }
  })

  it('stretches when the button it stands in for does', () => {
    expect(renderToStaticMarkup(<ButtonSkeleton fullWidth />)).toContain('w-full')
  })

  it('respects reduced motion', () => {
    expect(renderToStaticMarkup(<ButtonSkeleton />)).toContain('motion-reduce:animate-none')
  })
})
