import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Checkbox } from '../index.js'

// The Authoring Practices checkbox: Tab reaches it, Space toggles it; Enter and the arrows do not.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction, onCheckedChange, onSubmit }: { direction: 'ltr' | 'rtl', onCheckedChange: (next: boolean) => void, onSubmit?: () => void }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form dir={direction} onSubmit={(event) => { event.preventDefault(); onSubmit?.() }}>
        <button type="button">Before</button>
        <Checkbox aria-label="Terms" name="terms" onCheckedChange={onCheckedChange} />
        <Checkbox aria-label="All" indeterminate />
        <Checkbox aria-label="Disabled" disabled />
        <button type="submit">After</button>
      </form>
    </TopClassProvider>
  )
}

const terms = () => screen.getByRole('checkbox', { name: 'Terms' })

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    it('Tab reaches each live box in order, skips a disabled one, and goes on to the next', async () => {
      render(<Page direction={direction} onCheckedChange={() => undefined} />)
      await userEvent.tab()
      expect(document.activeElement?.textContent).toBe('Before')
      await userEvent.tab()
      expect(document.activeElement).toBe(terms())
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'All' }))
      await userEvent.tab()
      expect(document.activeElement?.textContent).toBe('After')
    })

    it('Space toggles it once per press, on and off', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      render(<Page direction={direction} onCheckedChange={onCheckedChange} />)
      terms().focus()
      await userEvent.keyboard(' ')
      expect(terms().getAttribute('aria-checked')).toBe('true')
      await userEvent.keyboard(' ')
      expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true, false])
    })

    it('Enter leaves the state alone and submits the form it is in, as a native checkbox does', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      const onSubmit = vi.fn()
      render(<Page direction={direction} onCheckedChange={onCheckedChange} onSubmit={onSubmit} />)
      terms().focus()
      await userEvent.keyboard('{Enter}')
      await new Promise((done) => { queueMicrotask(() => { done(null) }) })
      expect(onCheckedChange).not.toHaveBeenCalled()
      expect(terms().getAttribute('aria-checked')).toBe('false')
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('Space on an indeterminate box asks for checked and leaves it mixed: its owner clears the dash', async () => {
      render(<Page direction={direction} onCheckedChange={() => undefined} />)
      const all = screen.getByRole('checkbox', { name: 'All' })
      all.focus()
      await userEvent.keyboard(' ')
      expect(all.getAttribute('aria-checked')).toBe('mixed')
    })

    it('no arrow key, Home or End moves it', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      render(<Page direction={direction} onCheckedChange={onCheckedChange} />)
      terms().focus()
      await userEvent.keyboard('{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}{Home}{End}')
      expect(onCheckedChange).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(terms())
    })
  })
}
