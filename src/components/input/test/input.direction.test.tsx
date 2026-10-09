import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { INPUT_LTR_TYPES } from '../constants.js'
import { Input } from '../index.js'
import type { InputProps } from '../types.js'

const html = (props: Partial<InputProps> = {}) => markup(<Input aria-label="Value" {...props} />)

// PLAN 12: numbers and emails stay left-to-right inside a right-to-left form.
describe('a Latin-ordered value stays left-to-right', () => {
  it('covers email, number, tel and url, and leaves password to the form', () => {
    expect(INPUT_LTR_TYPES).toEqual(['email', 'number', 'tel', 'url'])
  })

  /** Written out: in a right-to-left paragraph "-1234.5" paints as "1234.5-". */
  const LATIN = ['email', 'number', 'tel', 'url'] as const

  for (const type of LATIN) {
    it(`a ${type} field is dir="ltr" and says so on data-ltr`, () => {
      expect(attr(html({ type }), 'dir'), type).toBe('ltr')
      expect(attr(html({ type }), 'data-ltr'), type).toBe('')
    })
  }

  /** Written out: a name or a search may be Arabic, so these follow the form. */
  const FOLLOWS_THE_FORM = ['text', 'search', 'password', 'date'] as const

  for (const type of FOLLOWS_THE_FORM) {
    it(`a ${type} field takes no direction of its own`, () => {
      expect(attr(html({ type }), 'dir'), type).toBeUndefined()
      expect(attr(html({ type }), 'data-ltr'), type).toBeUndefined()
    })
  }

  it('takes no direction when no type is given', () => {
    expect(attr(html(), 'dir')).toBeUndefined()
    expect(attr(html(), 'data-ltr')).toBeUndefined()
  })
})

describe("the caller's dir wins", () => {
  it('keeps dir="auto" on an email field, with no data-ltr', () => {
    const out = html({ type: 'email', dir: 'auto' })
    expect(attr(out, 'dir')).toBe('auto')
    expect(attr(out, 'data-ltr')).toBeUndefined()
  })

  it('keeps dir="rtl" on a number field, with no data-ltr', () => {
    const out = html({ type: 'number', dir: 'rtl' })
    expect(attr(out, 'dir')).toBe('rtl')
    expect(attr(out, 'data-ltr')).toBeUndefined()
  })

  it('cannot be forged through the rest: data-ltr is what the component decided', () => {
    expect(attr(html({ type: 'text', ...{ 'data-ltr': 'yes' } }), 'data-ltr')).toBeUndefined()
    expect(attr(html({ type: 'tel', ...{ 'data-ltr': 'no' } }), 'data-ltr')).toBe('')
  })
})

describe('the forced direction keeps the side of the form', () => {
  it('aligns to the parent, which text-start would resolve against the input itself', () => {
    expect(classList(html())).toContain('data-ltr:text-match-parent')
  })

  it('orders a placeholder by its own script, only where the direction was forced', () => {
    const list = classList(html())
    expect(list).toContain('data-ltr:placeholder:[unicode-bidi:plaintext]')
    expect(list).not.toContain('placeholder:[unicode-bidi:plaintext]')
  })

  it('never names a physical side', () => {
    expect(classList(html({ type: 'number' })).join(' ')).not.toMatch(/text-(left|right)/)
  })
})
