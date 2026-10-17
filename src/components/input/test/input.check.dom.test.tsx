import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from '../index.js'

/** A submit as a button would send it once the browser's own check passed: the check is what stops it now. */
function submit(form: HTMLFormElement | null): boolean {
  const event = new Event('submit', { bubbles: true, cancelable: true })
  form?.dispatchEvent(event)
  return !event.defaultPrevented
}

const field = (name: string) => screen.getByRole<HTMLInputElement>('textbox', { name })

describe('validate', () => {
  it('holds a value written by script to the cap, after the attribute is removed', () => {
    render(<form><Input aria-label="Handle" maxLength={4} validate /></form>)
    const input = field('Handle')
    input.removeAttribute('maxlength')
    input.value = 'abcde'
    expect(submit(input.form)).toBe(false)
    expect(input.validationMessage).toBe('Use at most 4 characters')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('holds a text type to its default cap, which the caller never wrote', () => {
    render(<form><Input aria-label="Phone" type="tel" validate /></form>)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Phone' })
    input.value = '1'.repeat(33)
    expect(submit(input.form)).toBe(false)
    expect(input.validationMessage).toBe('Use at most 32 characters')
  })

  it('holds a value to its pattern', () => {
    render(<form><Input aria-label="Postcode" pattern="[0-9]{5}" validate /></form>)
    const input = field('Postcode')
    input.removeAttribute('pattern')
    input.value = '1234a'
    expect(submit(input.form)).toBe(false)
    expect(input.getAttribute('data-value-fault')).toBe('patternMismatch')
  })

  it('holds a number to min, max and step from the props, not the attributes', () => {
    render(<form><Input aria-label="Guests" type="number" min={1} max={8} validate /></form>)
    const input = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Guests' })
    for (const name of ['min', 'max', 'step']) input.removeAttribute(name)
    input.value = '9'
    expect(submit(input.form)).toBe(false)
    expect(input.validationMessage).toBe('Enter 8 or less')
    input.value = '0'
    expect(submit(input.form)).toBe(false)
    expect(input.validationMessage).toBe('Enter 1 or more')
    input.value = '2.5'
    expect(submit(input.form)).toBe(false)
    expect(input.getAttribute('data-value-fault')).toBe('stepMismatch')
    input.value = '3'
    expect(submit(input.form)).toBe(true)
    expect(input.hasAttribute('aria-invalid')).toBe(false)
  })

  it('takes a number default as the step base, as the browser does with no min', () => {
    render(<form><Input aria-label="Score" type="number" defaultValue="1.5" validate /></form>)
    const input = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Score' })
    input.value = '4.5'
    expect(submit(input.form)).toBe(true)
    input.value = '4'
    expect(submit(input.form)).toBe(false)
  })

  it('lets a value inside the rules through', () => {
    render(<form><Input aria-label="Handle" maxLength={4} validate /></form>)
    const input = field('Handle')
    input.value = 'abcd'
    expect(submit(input.form)).toBe(true)
    expect(input.validity.customError).toBe(false)
  })

  it('is off by default: the input stands alone, and a scripted value is the browser\'s alone', () => {
    const { container } = render(<form><Input aria-label="Handle" maxLength={4} /></form>)
    const input = field('Handle')
    expect(input.parentElement).toBe(container.querySelector('form'))
    input.value = 'abcde'
    expect(submit(input.form)).toBe(true)
  })
})
