import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Button } from '../index.js'
import { BUTTON_DEFAULTS, BUTTON_TONES, BUTTON_VARIANTS } from '../constants.js'
import type { ButtonProps } from '../types.js'

const html = (props: ButtonProps = {}) => renderToStaticMarkup(<Button {...props}>Save</Button>)
/** Anchored, or `id="x"` also matches inside `data-testid="x"`. */
const attr = (markup: string, name: string) =>
  new RegExp(`(?:^|[ ])${name}="([^"]*)"`).exec(markup)?.[1]
const classes = (props: ButtonProps = {}) => (attr(html(props), 'class') ?? '').split(/\s+/)

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
    const markup = html({ 'data-testid': 'x', id: 'save' } as ButtonProps)
    expect(attr(markup, 'data-testid')).toBe('x')
    expect(attr(markup, 'id')).toBe('save')
  })
})

describe('the design attributes', () => {
  it('reports its variant, tone and size, which the docs and tests read', () => {
    const markup = html({ variant: 'soft', tone: 'danger', size: 'lg' })
    expect(attr(markup, 'data-variant')).toBe('soft')
    expect(attr(markup, 'data-tone')).toBe('danger')
    expect(attr(markup, 'data-size')).toBe('lg')
  })

  it('reports the defaults when nothing is passed', () => {
    const markup = html()
    expect(attr(markup, 'data-variant')).toBe(BUTTON_DEFAULTS.variant)
    expect(attr(markup, 'data-tone')).toBe(BUTTON_DEFAULTS.tone)
    expect(attr(markup, 'data-size')).toBe(BUTTON_DEFAULTS.size)
  })

  it('uses presence attributes, never data-state', () => {
    expect(html({ loading: true })).not.toContain('data-state')
    expect(attr(html({ loading: true }), 'data-loading')).toBe('')
  })
})

describe('every variant', () => {
  for (const variant of BUTTON_VARIANTS) {
    it(`${variant} emits its own classes and no other variant's fill`, () => {
      const list = classes({ variant })
      expect(list).toContain('inline-flex')
      expect(attr(html({ variant }), 'data-variant')).toBe(variant)
    })
  }

  it('solid fills with the tone and puts the on-solid text on it', () => {
    const list = classes({ variant: 'solid' })
    expect(list).toContain('bg-primary-solid')
    expect(list).toContain('text-primary-on-solid')
  })

  it('soft tints with the tone and puts the on-soft text on it', () => {
    const list = classes({ variant: 'soft' })
    expect(list).toContain('bg-primary-soft')
    expect(list).toContain('text-primary-on-soft')
  })

  it('outline draws a visible boundary rather than the decorative hairline', () => {
    expect(classes({ variant: 'outline' })).toContain('border-line-strong')
  })

  it('ghost and link carry no fill at rest', () => {
    for (const variant of ['ghost', 'link'] as const) {
      const list = classes({ variant })
      expect(list.filter((c) => c.startsWith('bg-')), variant).toEqual([])
    }
  })
})

describe('every tone', () => {
  for (const tone of BUTTON_TONES) {
    it(`${tone} applies its own utility, so the hover classes never change`, () => {
      expect(classes({ tone })).toContain(`tone-${tone}`)
    })

    it(`${tone} solid uses its own fill and label`, () => {
      const list = classes({ variant: 'solid', tone })
      expect(list).toContain(`bg-${tone}-solid`)
      expect(list).toContain(`text-${tone}-on-solid`)
    })

    it(`${tone} ghost uses its own text colour`, () => {
      expect(classes({ variant: 'ghost', tone })).toContain(`text-${tone}-on-soft`)
    })
  }

  it('reads hover and active from the variables a tone swaps', () => {
    const list = classes({ variant: 'solid' })
    expect(list).toContain('hover:bg-(--tc-hover)')
    expect(list).toContain('active:bg-(--tc-active)')
  })

  it('names no palette colour anywhere, in any combination', () => {
    const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
    for (const variant of BUTTON_VARIANTS) {
      for (const tone of BUTTON_TONES) {
        const list = classes({ variant, tone })
        expect(list.filter((c) => palette.test(c)), `${variant}/${tone}`).toEqual([])
      }
    }
  })
})
