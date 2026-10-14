import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Textarea } from '../index.js'

/** The counter of the one field on the page: what is seen, what is read, and its limit state. */
function counterOf(field: HTMLElement) {
  const id = field.getAttribute('aria-describedby')?.split(' ').at(-1) ?? 'none'
  const counter = document.getElementById(id)
  if (!counter) return null
  return {
    seen: counter.querySelector('[aria-hidden]')?.textContent ?? '',
    read: counter.querySelector('.sr-only')?.textContent ?? '',
    state: counter.hasAttribute('data-at-limit') ? 'at' : counter.hasAttribute('data-over-limit') ? 'over' : 'under',
  }
}

describe('the counter', () => {
  it('with showCount follows the typing, and turns to at-limit at the cap, where the browser stops it', async () => {
    render(<Textarea aria-label="Bio" showCount maxLength={8} />)
    const field = screen.getByRole('textbox', { name: 'Bio' })
    expect(counterOf(field)).toEqual({ seen: '0 / 8', read: '0 of 8 characters', state: 'under' })
    await userEvent.type(field, 'Hello')
    expect(counterOf(field)).toEqual({ seen: '5 / 8', read: '5 of 8 characters', state: 'under' })
    await userEvent.type(field, ' world')
    expect(counterOf(field)).toEqual({ seen: '8 / 8', read: '8 of 8 characters', state: 'at' })
  })

  it('is over the limit only when code sets a longer value, and the field is not marked invalid by it', () => {
    render(<Textarea aria-label="Bio" showCount maxLength={4} value="Too long" onChange={() => undefined} />)
    const field = screen.getByRole('textbox', { name: 'Bio' })
    expect(counterOf(field)).toEqual({ seen: '8 / 4', read: '8 of 4 characters', state: 'over' })
    expect(field.hasAttribute('aria-invalid')).toBe(false)
  })

  it('with autosize alone stays empty until nine tenths of the cap, then shows', async () => {
    render(<Textarea aria-label="Bio" autosize maxLength={10} />)
    const field = screen.getByRole('textbox', { name: 'Bio' })
    await userEvent.type(field, '12345678')
    expect(counterOf(field)).toEqual({ seen: '', read: '', state: 'under' })
    await userEvent.type(field, '9')
    expect(counterOf(field)).toEqual({ seen: '9 / 10', read: '9 of 10 characters', state: 'under' })
  })

  it('follows a controlled value set by its owner, with no input event', () => {
    const { rerender } = render(<Textarea aria-label="Bio" showCount maxLength={20} value="Hi" onChange={() => undefined} />)
    rerender(<Textarea aria-label="Bio" showCount maxLength={20} value="Hello there" onChange={() => undefined} />)
    expect(counterOf(screen.getByRole('textbox'))?.seen).toBe('11 / 20')
  })

  it('reads in the provider language and digits', () => {
    render(
      <TopClassProvider direction="rtl" locale="ar" numberingSystem="arab">
        <Textarea aria-label="نبذة" showCount maxLength={500} defaultValue="مرحبا" />
      </TopClassProvider>,
    )
    expect(counterOf(screen.getByRole('textbox'))).toEqual({ seen: '٥ / ٥٠٠', read: 'عدد الأحرف: ٥ من ٥٠٠', state: 'under' })
  })

  it('goes back with the text after a form reset, which sends no input event', async () => {
    render(<form><Textarea aria-label="Bio" showCount maxLength={50} defaultValue="Hello" /></form>)
    const field = screen.getByRole('textbox', { name: 'Bio' })
    await userEvent.type(field, ' and more')
    expect(counterOf(field)?.seen).toBe('14 / 50')
    field.closest('form')?.reset()
    await vi.waitFor(() => { expect(counterOf(field)?.seen).toBe('5 / 50') })
  })
})

describe('aria-describedby', () => {
  it("keeps the caller's id first and adds the counter's", () => {
    render(<Textarea aria-label="Bio" showCount aria-describedby="bio-hint" />)
    const ids = screen.getByRole('textbox').getAttribute('aria-describedby')?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(ids[0]).toBe('bio-hint')
    expect(document.getElementById(ids[1] ?? '')?.textContent).toBe('0 / 5,0000 of 5,000 characters')
  })

  it('names the counter even before it shows, so the description never changes its target', () => {
    render(<Textarea aria-label="Bio" autosize />)
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toMatch(/\S/)
  })

  it('is left alone on a plain field and on one with no cap', () => {
    render(<><Textarea aria-label="A" aria-describedby="a-hint" /><Textarea aria-label="B" showCount maxLength={null} /></>)
    expect(screen.getByRole('textbox', { name: 'A' }).getAttribute('aria-describedby')).toBe('a-hint')
    expect(screen.getByRole('textbox', { name: 'B' }).hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('the rows a field with autosize is given', () => {
  it('starts from the caller rows, and a ref reaches the textarea itself', () => {
    let node: HTMLTextAreaElement | null = null
    render(<Textarea aria-label="Bio" autosize rows={2} ref={(el) => { node = el }} />)
    expect(node).toBe(screen.getByRole('textbox'))
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('2')
  })
})
