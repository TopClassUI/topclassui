import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { useValueCheck } from './hook.js'
import type { ValueRules } from './lib.js'

function Checked({ rules, own }: { rules: ValueRules, own?: 'false' | 'true' | undefined }) {
  const ref = useRef(null as HTMLInputElement | null)
  useValueCheck({ field: () => ref.current, rules })
  return <input ref={ref} aria-label="Code" aria-invalid={own} />
}

function Hidden({ rules }: { rules: ValueRules }) {
  const sent = useRef(null as HTMLInputElement | null)
  const shown = useRef(null as HTMLInputElement | null)
  useValueCheck({ field: () => sent.current, marks: () => (shown.current ? [shown.current] : []), rules })
  return <><input ref={shown} aria-label="Shown" /><input ref={sent} name="sent" aria-hidden tabIndex={-1} /></>
}

/** Writes the value as a script would: no event at all. */
function script(input: HTMLInputElement, text: string) {
  input.value = text
}

describe('the check', () => {
  it('leaves a value inside its rules unmarked', () => {
    render(<Checked rules={{ maxLength: 4 }} />)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    fireEvent.input(input, { target: { value: 'abcd' } })
    expect(input.validity.customError).toBe(false)
    expect(input.hasAttribute('aria-invalid')).toBe(false)
    expect(input.hasAttribute('data-value-fault')).toBe(false)
  })

  it('marks a value past the cap on input, with the message, aria-invalid and the fault', () => {
    render(<Checked rules={{ maxLength: 4 }} />)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    fireEvent.input(input, { target: { value: 'abcde' } })
    expect(input.validationMessage).toBe('Use at most 4 characters')
    expect(input.validity.customError).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('data-value-fault')).toBe('tooLong')
  })

  it('clears the mark once the value is back inside, and gives the caller its own aria-invalid back', () => {
    render(<Checked rules={{ pattern: '[0-9]*' }} own="false" />)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    fireEvent.input(input, { target: { value: '12a' } })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    fireEvent.input(input, { target: { value: '12' } })
    expect(input.validity.customError).toBe(false)
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.hasAttribute('data-value-fault')).toBe(false)
  })

  it('reads a value set by code on blur', () => {
    render(<Checked rules={{ numeric: true, max: 10 }} />)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    script(input, '11')
    expect(input.validity.customError).toBe(false)
    fireEvent.focusOut(input)
    expect(input.validationMessage).toBe('Enter 10 or less')
  })

  it('stops the submit of a value set by code, which fired no event, before the form hears it', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => { event.preventDefault() })
    render(<form onSubmit={onSubmit}><Checked rules={{ maxLength: 2 }} /></form>)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    script(input, 'abc')
    const event = new Event('submit', { bubbles: true, cancelable: true })
    input.form?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(input.getAttribute('data-value-fault')).toBe('tooLong')
    expect(document.activeElement).toBe(input)
  })

  it('lets the submit of a value inside its rules through', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => { event.preventDefault() })
    render(<form onSubmit={onSubmit}><Checked rules={{ maxLength: 2 }} /></form>)
    script(screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' }), 'ab')
    fireEvent.submit(screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' }).form as HTMLFormElement)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('reads the hidden input the form sends and marks the visible one, which takes the focus on a stopped submit', () => {
    render(<form><Hidden rules={{ maxLength: 3, pattern: '[0-9]*' }} /></form>)
    const shown = screen.getByRole<HTMLInputElement>('textbox', { name: 'Shown' })
    const sent = shown.form?.elements.namedItem('sent') as HTMLInputElement
    script(sent, '12x')
    const event = new Event('submit', { bubbles: true, cancelable: true })
    shown.form?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(shown.validationMessage).toBe('Use the format asked for')
    expect(shown.getAttribute('aria-invalid')).toBe('true')
    expect(sent.validity.customError).toBe(false)
    expect(sent.hasAttribute('data-value-fault')).toBe(false)
    expect(document.activeElement).toBe(shown)
  })

  it('reads the form again after a reset', async () => {
    render(<form><Checked rules={{ maxLength: 2 }} /></form>)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    fireEvent.input(input, { target: { value: 'abc' } })
    expect(input.validity.customError).toBe(true)
    input.form?.reset()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(input.validity.customError).toBe(false)
  })

  it('speaks the provider\'s language and digits', () => {
    render(<TopClassProvider direction="rtl" locale="ar" numberingSystem="arab"><Checked rules={{ numeric: true, min: 5 }} /></TopClassProvider>)
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' })
    fireEvent.input(input, { target: { value: '3' } })
    expect(input.validationMessage).toBe('أدخل ٥ أو أكثر')
  })
})
