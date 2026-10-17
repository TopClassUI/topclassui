import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OTPField } from '../index.js'

function submit(form: HTMLFormElement | null): boolean {
  const event = new Event('submit', { bubbles: true, cancelable: true })
  form?.dispatchEvent(event)
  return !event.defaultPrevented
}

/** The hidden input the form sends, which a script reaches by its name. */
const sent = () => document.querySelector<HTMLInputElement>('input[name="code"]')

describe('the check', () => {
  it('holds a code written into the sent input to the cells and to digits, and marks every cell', () => {
    render(<form><label htmlFor="otp">Code</label><OTPField id="otp" name="code" length={4} /></form>)
    const input = sent()
    if (!input) throw new Error('no sent input')
    input.value = '12a4'
    expect(submit(input.form)).toBe(false)
    const cells = screen.getAllByRole<HTMLInputElement>('textbox')
    expect(cells.map((cell) => cell.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true', 'true'])
    expect(cells[0]?.validationMessage).toBe('Use the format asked for')
    expect(input.validity.customError).toBe(false)
  })

  it('holds it to the count of cells, after maxlength is removed', () => {
    render(<form><label htmlFor="otp">Code</label><OTPField id="otp" name="code" length={4} /></form>)
    const input = sent()
    if (!input) throw new Error('no sent input')
    input.removeAttribute('maxlength')
    input.value = '12345'
    expect(submit(input.form)).toBe(false)
    expect(screen.getAllByRole<HTMLInputElement>('textbox')[0]?.validationMessage).toBe('Use at most 4 characters')
  })

  it('holds a letter field to letters, the kind Base UI keeps', () => {
    render(<form><label htmlFor="otp">Code</label><OTPField id="otp" name="code" length={4} validationType="alpha" /></form>)
    const input = sent()
    if (!input) throw new Error('no sent input')
    input.removeAttribute('pattern')
    input.value = 'ab1d'
    expect(submit(input.form)).toBe(false)
    input.value = 'abcd'
    expect(submit(input.form)).toBe(true)
  })

  it('lets a partial code through, as the browser does: completeness is the caller\'s', () => {
    render(<form><label htmlFor="otp">Code</label><OTPField id="otp" name="code" length={4} /></form>)
    const input = sent()
    if (!input) throw new Error('no sent input')
    input.value = '12'
    expect(submit(input.form)).toBe(true)
  })
})
