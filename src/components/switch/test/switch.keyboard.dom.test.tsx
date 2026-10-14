import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Switch } from '../index.js'

// The Authoring Practices switch: Tab reaches it, Space and Enter toggle it, and no arrow key does.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction, onCheckedChange }: { direction: 'ltr' | 'rtl', onCheckedChange: (next: boolean) => void }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <Switch aria-label="Digest" onCheckedChange={onCheckedChange} />
        <Switch aria-label="Disabled" disabled />
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    it('Tab reaches the switch after the button before it, skips a disabled one, and goes on to the next', async () => {
      render(<Page direction={direction} onCheckedChange={() => undefined} />)
      await userEvent.tab()
      expect(document.activeElement?.textContent).toBe('Before')
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Digest' }))
      await userEvent.tab()
      expect(document.activeElement?.textContent).toBe('After')
    })

    it('Space toggles it once per press, on and off', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      render(<Page direction={direction} onCheckedChange={onCheckedChange} />)
      screen.getByRole('switch', { name: 'Digest' }).focus()
      await userEvent.keyboard(' ')
      expect(screen.getByRole('switch', { name: 'Digest' }).getAttribute('aria-checked')).toBe('true')
      await userEvent.keyboard(' ')
      expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true, false])
    })

    it('Enter toggles it once per press', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      render(<Page direction={direction} onCheckedChange={onCheckedChange} />)
      screen.getByRole('switch', { name: 'Digest' }).focus()
      await userEvent.keyboard('{Enter}')
      expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true])
      expect(screen.getByRole('switch', { name: 'Digest' }).getAttribute('aria-checked')).toBe('true')
    })

    it('no arrow key, Home or End moves it', async () => {
      const onCheckedChange = vi.fn((next: boolean) => next)
      render(<Page direction={direction} onCheckedChange={onCheckedChange} />)
      screen.getByRole('switch', { name: 'Digest' }).focus()
      await userEvent.keyboard('{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}{Home}{End}')
      expect(onCheckedChange).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Digest' }))
    })
  })
}
