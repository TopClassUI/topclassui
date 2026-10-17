import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NumberField } from '../index.js'

function submit(form: HTMLFormElement | null): boolean {
  const event = new Event('submit', { bubbles: true, cancelable: true })
  form?.dispatchEvent(event)
  return !event.defaultPrevented
}

/** The hidden number input the form sends, with its bounds removed as a DevTools edit would. */
function bypassed(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[name="guests"]')
  if (!input) throw new Error('no sent input')
  for (const name of ['min', 'max', 'step']) input.removeAttribute(name)
  return input
}

const visible = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'Guests' })

describe('the check', () => {
  it('holds a number written into the sent input to max, and marks the visible input', () => {
    render(<form><NumberField aria-label="Guests" name="guests" defaultValue={2} min={1} max={8} /></form>)
    const input = bypassed()
    input.value = '50'
    expect(submit(input.form)).toBe(false)
    expect(visible().validationMessage).toBe('Enter 8 or less')
    expect(visible().getAttribute('aria-invalid')).toBe('true')
    expect(input.validity.customError).toBe(false)
  })

  it('holds it to min, and to the step from min', () => {
    render(<form><NumberField aria-label="Guests" name="guests" defaultValue={2} min={1} max={8} /></form>)
    const input = bypassed()
    input.value = '0'
    expect(submit(input.form)).toBe(false)
    expect(visible().validationMessage).toBe('Enter 1 or more')
    input.value = '2.5'
    expect(submit(input.form)).toBe(false)
    expect(visible().getAttribute('data-value-fault')).toBe('stepMismatch')
    input.value = '3'
    expect(submit(input.form)).toBe(true)
  })

  it('with allowOutOfRange holds no bound, as Base UI does not', () => {
    render(<form><NumberField aria-label="Guests" name="guests" min={1} max={8} allowOutOfRange /></form>)
    const input = bypassed()
    input.value = '50'
    expect(submit(input.form)).toBe(true)
  })

  it('with no min checks no step, since the browser steps from the value React keeps in the attribute', () => {
    render(<form><NumberField aria-label="Guests" name="guests" /></form>)
    const input = bypassed()
    input.value = '2.5'
    expect(submit(input.form)).toBe(true)
  })
})
