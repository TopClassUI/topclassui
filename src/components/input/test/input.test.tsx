import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { INPUT_CAPPED_TYPES } from '../constants.js'
import { Input } from '../index.js'
import type { InputProps } from '../types.js'

const html = (props: Partial<InputProps> = {}) => markup(<Input aria-label="Email" {...props} />)

describe('Input', () => {
  it('is one native input and nothing around it', () => {
    expect(html()).toMatch(/^<input [^<>]*\/>$/)
  })

  it('is a text field unless the caller says otherwise', () => {
    expect(attr(html(), 'type')).toBe('text')
    expect(attr(html({ type: 'email' }), 'type')).toBe('email')
  })

  it('reports the default size on data-size', () => {
    expect(attr(html(), 'data-size')).toBe('md')
  })

  it('carries the name it was given, each of the three ways', () => {
    expect(attr(html(), 'aria-label')).toBe('Email')
    expect(attr(markup(<Input id="email" />), 'id')).toBe('email')
    expect(attr(markup(<Input aria-labelledby="email-label" />), 'aria-labelledby')).toBe('email-label')
  })

  it('passes every native input prop through', () => {
    const out = html({
      name: 'email', placeholder: 'you@example.com', autoComplete: 'email', required: true,
      readOnly: true, disabled: true, defaultValue: 'a@b.co', title: 'Your email',
    })
    expect(attr(out, 'name')).toBe('email')
    expect(attr(out, 'placeholder')).toBe('you@example.com')
    expect(attr(out, 'autoComplete')).toBe('email')
    expect(attr(out, 'required')).toBe('')
    expect(attr(out, 'readOnly')).toBe('')
    expect(attr(out, 'disabled')).toBe('')
    expect(attr(out, 'value')).toBe('a@b.co')
    expect(attr(out, 'title')).toBe('Your email')
  })

  it('passes style and data attributes to the input itself', () => {
    const out = html({ style: { '--tc-ring-width': '4px' }, ...{ 'data-testid': 'field' } })
    expect(attr(out, 'style')).toBe('--tc-ring-width:4px')
    expect(attr(out, 'data-testid')).toBe('field')
  })
})

describe('maxLength (R-5.7-8)', () => {
  /** Written out from TEXT_MAX_LENGTH, so a changed cap is a failure here too. */
  const CAPS = [
    ['text', '512'], ['email', '254'], ['url', '2048'], ['tel', '32'], ['search', '256'], ['password', '256'],
  ] as const

  for (const [type, cap] of CAPS) {
    it(`a ${type} field takes the default of its type, ${cap}`, () => {
      expect(attr(html({ type }), 'maxLength')).toBe(cap)
    })
  }

  it('takes the text default when no type is given', () => {
    expect(attr(html(), 'maxLength')).toBe('512')
  })

  it("takes the caller's number over the default", () => {
    expect(attr(html({ maxLength: 6 }), 'maxLength')).toBe('6')
    expect(attr(html({ type: 'email', maxLength: 40 }), 'maxLength')).toBe('40')
  })

  it('takes none for null, which is how a caller removes the cap', () => {
    expect(html({ maxLength: null })).not.toContain('maxLength')
  })

  /** Written out: HTML allows maxlength on the six types above and on none of these. */
  const UNCAPPED = [
    'number', 'date', 'checkbox', 'range', 'file', 'color', 'hidden', 'radio', 'time', 'datetime-local', 'month',
  ] as const

  for (const type of UNCAPPED) {
    it(`a ${type} field gets no maxLength attribute at all`, () => {
      expect(attr(html({ type }), 'type')).toBe(type)
      expect(html({ type })).not.toMatch(/maxlength/i)
    })

    it(`a ${type} field drops a caller's number too, since the attribute is not allowed there`, () => {
      expect(html({ type, maxLength: 3 })).not.toMatch(/maxlength/i)
    })
  }

  it('caps exactly six types, the ones HTML allows maxlength on', () => {
    expect(INPUT_CAPPED_TYPES).toEqual(['text', 'search', 'url', 'tel', 'email', 'password'])
  })

  it('gives any other type no cap, rather than guessing it is text', () => {
    expect(html({ type: 'week' })).not.toMatch(/maxlength/i)
  })

  it('keeps min, max and step on a number field, which are its real bounds', () => {
    const out = html({ type: 'number', min: 0, max: 120, step: 5 })
    expect(attr(out, 'min')).toBe('0')
    expect(attr(out, 'max')).toBe('120')
    expect(attr(out, 'step')).toBe('5')
  })
})

describe('invalid', () => {
  it('is off by default: no aria-invalid and no data-invalid', () => {
    expect(attr(html(), 'aria-invalid')).toBeUndefined()
    expect(attr(html(), 'data-invalid')).toBeUndefined()
  })

  it('sets aria-invalid for a screen reader and data-invalid as a presence attribute', () => {
    const out = html({ invalid: true })
    expect(attr(out, 'aria-invalid')).toBe('true')
    expect(attr(out, 'data-invalid')).toBe('')
  })

  it('emits nothing for invalid={false}, never the string "false"', () => {
    expect(html({ invalid: false })).not.toMatch(/invalid=/)
  })

  it("keeps a caller's own aria-invalid, which is how a Field marks its control", () => {
    expect(attr(html({ 'aria-invalid': true }), 'aria-invalid')).toBe('true')
    expect(attr(html({ 'aria-invalid': 'spelling' }), 'aria-invalid')).toBe('spelling')
  })

  it('lets invalid win over an aria-invalid that says otherwise', () => {
    expect(attr(html({ invalid: true, 'aria-invalid': false }), 'aria-invalid')).toBe('true')
  })
})

describe('what the component writes cannot be overwritten through the rest', () => {
  it('keeps data-size and data-invalid as the props decided them', () => {
    const out = html({ size: 'lg', invalid: true, ...{ 'data-size': 'xs', 'data-invalid': 'no' } })
    expect(attr(out, 'data-size')).toBe('lg')
    expect(attr(out, 'data-invalid')).toBe('')
  })
})
