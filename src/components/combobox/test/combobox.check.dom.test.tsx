import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Combobox } from '../index.js'

const ITEMS = [{ value: 'next', label: 'Next.js' }, { value: 'astro', label: 'Astro' }]

function submit(form: HTMLFormElement | null): boolean {
  const event = new Event('submit', { bubbles: true, cancelable: true })
  form?.dispatchEvent(event)
  return !event.defaultPrevented
}

const input = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Framework' })

describe('the check', () => {
  it('holds a query written by script to the cap of a search field, 256', () => {
    render(<form><Combobox aria-label="Framework" name="framework" items={ITEMS} /></form>)
    input().removeAttribute('maxlength')
    input().value = 'x'.repeat(257)
    expect(submit(input().form)).toBe(false)
    expect(input().validationMessage).toBe('Use at most 256 characters')
    expect(input().getAttribute('aria-invalid')).toBe('true')
  })

  it('holds a pasted query to the caller\'s cap, and clears once it is back inside', () => {
    render(<form><Combobox aria-label="Framework" name="framework" items={ITEMS} maxLength={5} /></form>)
    input().removeAttribute('maxlength')
    fireEvent.input(input(), { target: { value: 'Next.js!' } })
    expect(input().getAttribute('data-value-fault')).toBe('tooLong')
    fireEvent.input(input(), { target: { value: 'Next' } })
    expect(input().hasAttribute('data-value-fault')).toBe(false)
    expect(submit(input().form)).toBe(true)
  })
})
