import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '../index.js'

// The editable combobox of the Authoring Practices, Base UI's, in both directions; e2e/combobox.spec.ts repeats it in Chromium.
const ITEMS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }, { value: 'c', label: 'Charlie' }]

const input = () => screen.getByRole<HTMLInputElement>('combobox')
/** The text of the row aria-activedescendant names, or null when the highlight is on the input. */
const active = () => {
  const id = input().getAttribute('aria-activedescendant')
  return id === null ? null : (document.getElementById(id)?.textContent ?? '(missing)')
}

for (const direction of ['ltr', 'rtl'] as const) {
  describe(`${direction}, under the provider`, () => {
    const mount = () => render(
      <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
        <Combobox aria-label="Letter" name="letter" items={ITEMS} />
      </TopClassProvider>,
    )

    it('ArrowDown opens on the first row; the arrows move and wrap through the input', async () => {
      mount()
      input().focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeTruthy()
      const steps: (string | null)[] = [active()]
      for (const key of ['{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowUp}', '{ArrowUp}']) {
        await userEvent.keyboard(key)
        steps.push(active())
      }
      expect(steps).toEqual(['Alpha', 'Bravo', 'Charlie', null, 'Alpha', null, 'Charlie'])
    })

    it('ArrowLeft and ArrowRight move the caret only: the highlight stays', async () => {
      mount()
      input().focus()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await userEvent.keyboard('{ArrowLeft}{ArrowRight}')
      expect(active()).toBe('Bravo')
    })

    it('Enter chooses the highlighted row and closes; the hidden input follows', async () => {
      mount()
      input().focus()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(input().value).toBe('Bravo')
      expect(document.querySelector<HTMLInputElement>('input[name="letter"]')?.value).toBe('b')
    })

    it('Escape closes the list; a second Escape, on the closed input, clears the value', async () => {
      mount()
      input().focus()
      await userEvent.keyboard('{ArrowDown}{Enter}')
      expect(input().value).toBe('Alpha')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(input().value).toBe('Alpha')
      await userEvent.keyboard('{Escape}')
      expect(input().value).toBe('')
      expect(document.querySelector<HTMLInputElement>('input[name="letter"]')?.value).toBe('')
    })

    it('typing opens the list on the matches, by contains', async () => {
      mount()
      await userEvent.type(input(), 'ar')
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Charlie'])
    })
  })
}
