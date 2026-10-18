import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '../index.js'
import type { DatePickerProps } from '../types.js'

/** The Authoring Practices date picker dialog, its grid: each key in each direction, read off the focused day's name. */
const focused = () => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName

async function opened(props: Partial<DatePickerProps>, direction: 'ltr' | 'rtl' = 'ltr') {
  const { container } = render(
    <TopClassProvider direction={direction} locale="en">
      <DatePicker aria-label="Check-in" name="checkIn" firstDayOfWeek={1} {...props} />
    </TopClassProvider>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Check-in' }))
  const grid = await screen.findByRole('grid')
  await waitFor(() => { expect(grid.contains(document.activeElement)).toBe(true) })
  return { container, grid }
}

const press = async (key: string, expected: string) => {
  await userEvent.keyboard(key)
  await waitFor(() => { expect(focused()).toBe(expected) })
}

describe('the keys move the active day, and the focus with it', () => {
  for (const direction of ['ltr', 'rtl'] as const) {
    const [next, previous] = direction === 'ltr' ? ['{ArrowRight}', '{ArrowLeft}'] : ['{ArrowLeft}', '{ArrowRight}']

    it(`${direction}: ${next} is the next day and ${previous} the day before; the arrows up and down move a week`, async () => {
      await opened({ defaultValue: '2026-09-22' }, direction)
      expect(focused()).toBe('Tuesday, September 22, 2026')
      await press(next, 'Wednesday, September 23, 2026')
      await press(previous, 'Tuesday, September 22, 2026')
      await press('{ArrowDown}', 'Tuesday, September 29, 2026')
      await press('{ArrowUp}', 'Tuesday, September 22, 2026')
    })

    it(`${direction}: Home and End go to the first and the last day of the week, PageUp and PageDown a month, with Shift a year`, async () => {
      await opened({ defaultValue: '2026-09-23' }, direction)
      await press('{Home}', 'Monday, September 21, 2026')
      await press('{End}', 'Sunday, September 27, 2026')
      await press('{PageDown}', 'Tuesday, October 27, 2026')
      expect(screen.getByRole('heading').textContent).toBe('October 2026')
      await press('{PageUp}', 'Sunday, September 27, 2026')
      await press('{Shift>}{PageDown}{/Shift}', 'Monday, September 27, 2027')
      await press('{Shift>}{PageUp}{/Shift}', 'Sunday, September 27, 2026')
    })
  }

  it('crossing into another month shows that month: ArrowRight from 30 September is 1 October', async () => {
    await opened({ defaultValue: '2026-09-30' })
    await press('{ArrowRight}', 'Thursday, October 1, 2026')
    expect(screen.getByRole('heading').textContent).toBe('October 2026')
  })

  it('PageUp from 31 March is 28 February, the day kept inside the month', async () => {
    await opened({ defaultValue: '2026-03-31' })
    await press('{PageUp}', 'Saturday, February 28, 2026')
  })

  for (const direction of ['ltr', 'rtl'] as const) {
    it(`${direction}: Home in the first row and End in the last cross into the month the week starts or ends in`, async () => {
      await opened({ defaultValue: '2026-09-03' }, direction)
      await press('{Home}', 'Monday, August 31, 2026')
      expect(screen.getByRole('heading').textContent).toBe('August 2026')
      await press('{End}', 'Sunday, September 6, 2026')
      expect(screen.getByRole('heading').textContent).toBe('September 2026')
      await press('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}', 'Sunday, October 4, 2026')
      await press('{Home}', 'Monday, September 28, 2026')
      expect(screen.getByRole('heading').textContent).toBe('September 2026')
      await press('{End}', 'Sunday, October 4, 2026')
      expect(screen.getByRole('heading').textContent).toBe('October 2026')
    })
  }

  it('Home and End across the month edge still stop at minDate and maxDate', async () => {
    await opened({ defaultValue: '2026-09-03', minDate: '2026-09-02', maxDate: '2026-10-02' })
    await press('{Home}', 'Wednesday, September 2, 2026')
    await press('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}', 'Wednesday, September 30, 2026')
    await press('{End}', 'Friday, October 2, 2026')
  })

  for (const direction of ['ltr', 'rtl'] as const) {
    it(`${direction}: with nothing chosen the keys start from today, and Enter chooses where they end`, async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 15, 12) })
      try {
        const onValueChange = vi.fn()
        await opened({ onValueChange }, direction)
        expect(focused()).toBe('Thursday, October 15, 2026')
        await press(direction === 'ltr' ? '{ArrowRight}' : '{ArrowLeft}', 'Friday, October 16, 2026')
        await press('{End}', 'Sunday, October 18, 2026')
        await press('{Home}', 'Monday, October 12, 2026')
        await userEvent.keyboard('{Enter}')
        await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
        expect(onValueChange.mock.calls).toEqual([['2026-10-12']])
      } finally {
        vi.useRealTimers()
      }
    })
  }

  it('the range stops the active day: no key moves it past minDate or maxDate', async () => {
    await opened({ defaultValue: '2026-09-26', minDate: '2026-09-25', maxDate: '2026-10-03' })
    await press('{ArrowLeft}', 'Friday, September 25, 2026')
    await press('{ArrowLeft}', 'Friday, September 25, 2026')
    await press('{ArrowUp}', 'Friday, September 25, 2026')
    await press('{PageDown}', 'Saturday, October 3, 2026')
    await press('{ArrowRight}', 'Saturday, October 3, 2026')
  })

  it('a value outside the range opens on its own month, and the first key brings the active day in', async () => {
    await opened({ defaultValue: '2030-01-15', minDate: '2026-09-25', maxDate: '2027-03-31' })
    expect(screen.getByRole('heading').textContent).toBe('January 2030')
    await press('{ArrowRight}', 'Wednesday, March 31, 2027')
  })
})

describe('Enter, Space and Escape', () => {
  it('Enter chooses the active day and closes, and the focus is back on the trigger', async () => {
    const onValueChange = vi.fn()
    const { container } = await opened({ defaultValue: '2026-09-22', onValueChange })
    await press('{ArrowRight}', 'Wednesday, September 23, 2026')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onValueChange.mock.calls).toEqual([['2026-09-23']])
    expect((container.querySelector('input[name="checkIn"]') as HTMLInputElement).value).toBe('2026-09-23')
    await waitFor(() => { expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Check-in' })) })
  })

  it('Space chooses as Enter does', async () => {
    const onValueChange = vi.fn()
    await opened({ defaultValue: '2026-09-22', onValueChange })
    await press('{ArrowDown}', 'Tuesday, September 29, 2026')
    await userEvent.keyboard(' ')
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onValueChange.mock.calls).toEqual([['2026-09-29']])
  })

  it('Escape closes with no change, the focus back on the trigger', async () => {
    const onValueChange = vi.fn()
    const { container } = await opened({ defaultValue: '2026-09-22', onValueChange })
    await press('{ArrowRight}{ArrowRight}', 'Thursday, September 24, 2026')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onValueChange).not.toHaveBeenCalled()
    expect((container.querySelector('input[name="checkIn"]') as HTMLInputElement).value).toBe('2026-09-22')
    await waitFor(() => { expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Check-in' })) })
  })

  it('Enter on a day outside the range does nothing', async () => {
    const onValueChange = vi.fn()
    await opened({ defaultValue: '2030-01-15', maxDate: '2027-03-31', onValueChange })
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(within(screen.getByRole('dialog')).getByRole('grid')).toBeTruthy()
  })

  it('a key with Ctrl, Alt or Meta is left to the browser', async () => {
    await opened({ defaultValue: '2026-09-22' })
    await userEvent.keyboard('{Control>}{ArrowRight}{/Control}{Alt>}{PageDown}{/Alt}')
    expect(focused()).toBe('Tuesday, September 22, 2026')
  })
})
