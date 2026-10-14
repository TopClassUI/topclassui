import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '../index.js'

// The Authoring Practices select-only combobox, all Base UI's; a list's arrows are vertical, so both directions agree.
const DIRECTIONS = ['ltr', 'rtl'] as const
const ITEMS = [
  { value: 'a', label: 'Amman' }, { value: 'b', label: 'Beirut' }, { value: 'c', label: 'Cairo', disabled: true },
  { value: 'd', label: 'Doha' }, { value: 'e', label: 'Erbil' },
]

function Page({ direction, onValueChange }: { direction: 'ltr' | 'rtl', onValueChange?: (next: string | null) => void }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <Select aria-label="City" name="city" items={ITEMS} defaultValue="b" onValueChange={onValueChange} />
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

const trigger = () => screen.getByRole('combobox')
const focused = () => document.activeElement?.textContent ?? ''
/** The focus moves to an option a frame after the list opens. */
const focusOn = (label: string) => waitFor(() => { expect(focused()).toBe(label) })
const closed = () => waitFor(() => { expect(trigger().getAttribute('aria-expanded')).toBe('false') })

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    it('Tab reaches the trigger, one stop, and the next Tab leaves it', async () => {
      render(<Page direction={direction} />)
      await userEvent.tab()
      await userEvent.tab()
      expect(document.activeElement).toBe(trigger())
      await userEvent.tab()
      expect(focused()).toBe('After')
    })

    it('ArrowDown opens the list on the chosen option; the arrows move, stop at both ends, and land on a disabled one', async () => {
      render(<Page direction={direction} />)
      trigger().focus()
      await userEvent.keyboard('{ArrowDown}')
      await focusOn('Beirut')
      expect(trigger().getAttribute('aria-expanded')).toBe('true')
      await userEvent.keyboard('{ArrowDown}')
      await focusOn('Cairo')
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
      await focusOn('Erbil')
      await userEvent.keyboard('{Home}')
      await focusOn('Amman')
      await userEvent.keyboard('{ArrowUp}')
      await focusOn('Amman')
      await userEvent.keyboard('{End}')
      await focusOn('Erbil')
    })

    it('Enter chooses the focused option, closes the list and gives the focus back to the trigger', async () => {
      const onValueChange = vi.fn((next: string | null) => next)
      render(<Page direction={direction} onValueChange={onValueChange} />)
      trigger().focus()
      await userEvent.keyboard('{ArrowDown}')
      await focusOn('Beirut')
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await focusOn('Doha')
      await userEvent.keyboard('{Enter}')
      await closed()
      expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['d'])
      expect(document.activeElement).toBe(trigger())
      expect(trigger().textContent).toBe('Doha')
    })

    it('Enter on a disabled option chooses nothing, and Escape closes with the value as it was', async () => {
      const onValueChange = vi.fn()
      render(<Page direction={direction} onValueChange={onValueChange} />)
      trigger().focus()
      await userEvent.keyboard('{ArrowDown}')
      await focusOn('Beirut')
      await userEvent.keyboard('{ArrowDown}')
      await focusOn('Cairo')
      await userEvent.keyboard('{Enter}')
      expect(onValueChange).not.toHaveBeenCalled()
      await userEvent.keyboard('{Escape}')
      await closed()
      expect(document.activeElement).toBe(trigger())
      expect(trigger().textContent).toBe('Beirut')
    })

    it('Space on the trigger opens the list as well', async () => {
      render(<Page direction={direction} />)
      trigger().focus()
      await userEvent.keyboard(' ')
      await focusOn('Beirut')
    })
  })
}
