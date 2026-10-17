import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Textarea } from '../index.js'

function submit(form: HTMLFormElement | null): boolean {
  const event = new Event('submit', { bubbles: true, cancelable: true })
  form?.dispatchEvent(event)
  return !event.defaultPrevented
}

const field = () => screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Bio' })

describe('the check', () => {
  it('with validate alone, the textarea sits in the holder, which holds a scripted value to the cap', () => {
    render(<form><Textarea aria-label="Bio" maxLength={4} validate /></form>)
    const textarea = field()
    expect(textarea.parentElement?.tagName).toBe('DIV')
    textarea.removeAttribute('maxlength')
    textarea.value = 'abcde'
    expect(submit(textarea.form)).toBe(false)
    expect(textarea.validationMessage).toBe('Use at most 4 characters')
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
  })

  it('runs in the holder that showCount loads anyway, on the input event a paste sends', () => {
    render(<form><Textarea aria-label="Bio" maxLength={4} showCount /></form>)
    const textarea = field()
    textarea.removeAttribute('maxlength')
    fireEvent.input(textarea, { target: { value: 'abcdef' } })
    expect(textarea.getAttribute('data-value-fault')).toBe('tooLong')
    fireEvent.input(textarea, { target: { value: 'abc' } })
    expect(textarea.hasAttribute('data-value-fault')).toBe(false)
    expect(submit(textarea.form)).toBe(true)
  })

  it('takes the default cap of 5000', () => {
    render(<form><Textarea aria-label="Bio" validate /></form>)
    const textarea = field()
    textarea.value = 'x'.repeat(5001)
    expect(submit(textarea.form)).toBe(false)
    expect(textarea.validationMessage).toBe('Use at most 5,000 characters')
  })

  it('with no cap checks nothing', () => {
    render(<form><Textarea aria-label="Bio" maxLength={null} validate /></form>)
    const textarea = field()
    textarea.value = 'x'.repeat(10_000)
    expect(submit(textarea.form)).toBe(true)
  })

  it('a plain Textarea loads no client code, so the browser alone checks it', () => {
    render(<form><Textarea aria-label="Bio" maxLength={4} /></form>)
    const textarea = field()
    expect(textarea.parentElement?.tagName).toBe('FORM')
    textarea.value = 'abcde'
    expect(submit(textarea.form)).toBe(true)
  })
})
