import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { FormErrorsContext } from '#shared/form-errors.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { FieldLive } from '#components/field/index.js'
import { DatePicker } from '../index.js'
import type { DatePickerProps } from '../types.js'

function CheckIn(props: Partial<DatePickerProps>) {
  return <DatePicker aria-label="Check-in" name="checkIn" {...props} />
}

const trigger = () => screen.getByRole('button', { name: 'Check-in' })
const hidden = (container: HTMLElement) => container.querySelector('input[aria-hidden="true"]') as HTMLInputElement

/** Opens the calendar with a click and waits for its lazy grid. */
async function open() {
  await userEvent.click(trigger())
  return screen.findByRole('grid')
}

describe('the popup', () => {
  it('is a dialog named by its month, holding previous, next, a button named Close and the grid', async () => {
    render(<CheckIn defaultValue="2026-09-22" />)
    await open()
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-labelledby')).toBe(within(dialog).getByRole('heading').id)
    expect(within(dialog).getByRole('heading').textContent).toBe('September 2026')
    expect(within(dialog).getAllByRole('button').slice(0, 3).map((b) => b.getAttribute('aria-label'))).toEqual(['Previous month', 'Next month', 'Close'])
    expect(within(dialog).getByRole('grid').getAttribute('aria-labelledby')).toBe(within(dialog).getByRole('heading').id)
  })

  it('a press on Close closes it with no change, and the focus is back on the trigger', async () => {
    const onValueChange = vi.fn()
    const { container } = render(<CheckIn defaultValue="2026-09-22" onValueChange={onValueChange} />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(hidden(container).value).toBe('2026-09-22')
    await waitFor(() => { expect(document.activeElement).toBe(trigger()) })
  })

  it('opens on the chosen day, which holds the focus and the one tab stop, and its cell is selected', async () => {
    render(<CheckIn defaultValue="2026-09-22" />)
    const grid = await open()
    const chosen = within(grid).getByRole('button', { name: 'Tuesday, September 22, 2026' })
    await waitFor(() => { expect(document.activeElement).toBe(chosen) })
    expect(chosen.hasAttribute('data-selected')).toBe(true)
    expect(chosen.closest('td')?.getAttribute('aria-selected')).toBe('true')
    expect(within(grid).getAllByRole('button').filter((b) => b.tabIndex === 0)).toEqual([chosen])
  })

  it('six rows of seven cells always; the cells outside the month are empty', async () => {
    render(<CheckIn defaultValue="2027-02-10" firstDayOfWeek={1} />)
    const grid = await open()
    const rows = within(grid).getAllByRole('row').slice(1)
    expect(rows.map((row) => row.querySelectorAll('td').length)).toEqual([7, 7, 7, 7, 7, 7])
    expect(within(grid).getAllByRole('button')).toHaveLength(28)
    expect(rows[5]?.textContent).toBe('')
  })

  it('the heads are one letter, with the whole name in abbr, from the first day asked for', async () => {
    render(<CheckIn defaultValue="2026-09-22" firstDayOfWeek={6} />)
    const grid = await open()
    const heads = within(grid).getAllByRole('columnheader')
    expect(heads.map((head) => head.textContent).join('')).toBe('SSMTWTF')
    expect(heads.map((head) => head.getAttribute('abbr'))).toEqual(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
  })

  it('with no firstDayOfWeek the locale decides: Sunday in en, Monday in en-GB, Saturday in ar', async () => {
    const first = async (locale: string) => {
      const { unmount } = render(<TopClassProvider direction="ltr" locale={locale}><CheckIn defaultValue="2026-09-22" /></TopClassProvider>)
      const grid = await open()
      const head = within(grid).getAllByRole('columnheader')[0]?.getAttribute('abbr')
      unmount()
      return head
    }
    expect([await first('en'), await first('en-GB'), await first('ar')]).toEqual(['Sunday', 'Monday', 'السبت'])
  })
})

describe('a choice', () => {
  it('a click on a day calls onValueChange once with its ISO date, closes, and the input holds it', async () => {
    const onValueChange = vi.fn()
    const { container } = render(<CheckIn defaultValue="2026-09-22" onValueChange={onValueChange} />)
    const grid = await open()
    await userEvent.click(within(grid).getByRole('button', { name: 'Thursday, September 24, 2026' }))
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onValueChange.mock.calls).toEqual([['2026-09-24']])
    expect(hidden(container).value).toBe('2026-09-24')
    expect(trigger().textContent).toBe('Sep 24, 2026')
  })

  it('after a choice, one input event reaches the form input, bubbling, with the new value already in it', async () => {
    const heard: string[] = []
    const { container } = render(<div onInput={(event) => { heard.push((event.target as HTMLInputElement).value) }}><CheckIn defaultValue="2026-09-22" /></div>)
    container.addEventListener('input', (event) => { heard.push(`native ${(event.target as HTMLInputElement).value}`) })
    const grid = await open()
    await userEvent.click(within(grid).getByRole('button', { name: 'Friday, September 25, 2026' }))
    await waitFor(() => { expect(heard).toEqual(['2026-09-25', 'native 2026-09-25']) })
  })

  it('choosing the day already chosen closes the popup and fires nothing', async () => {
    const onValueChange = vi.fn()
    const heard = vi.fn()
    const { container } = render(<CheckIn defaultValue="2026-09-22" onValueChange={onValueChange} />)
    container.addEventListener('input', heard)
    const grid = await open()
    await userEvent.click(within(grid).getByRole('button', { name: 'Tuesday, September 22, 2026' }))
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect([onValueChange.mock.calls.length, heard.mock.calls.length]).toEqual([0, 0])
  })

  it('a day outside minDate to maxDate is aria-disabled and a click does not choose it', async () => {
    const onValueChange = vi.fn()
    render(<CheckIn defaultValue="2026-10-02" minDate="2026-09-25" maxDate="2027-03-31" onValueChange={onValueChange} />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    const grid = screen.getByRole('grid')
    const early = within(grid).getByRole('button', { name: 'Thursday, September 24, 2026' })
    expect(early.getAttribute('aria-disabled')).toBe('true')
    expect(within(grid).getByRole('button', { name: 'Friday, September 25, 2026' }).hasAttribute('aria-disabled')).toBe(false)
    early.click()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('controlled: stays where its owner holds it, and follows the owner', async () => {
    function Owner() {
      const [value, setValue] = useState<string | null>('2026-09-22')
      return <><CheckIn value={value} onValueChange={setValue} /><output>{value}</output></>
    }
    render(<Owner />)
    const grid = await open()
    await userEvent.click(within(grid).getByRole('button', { name: 'Wednesday, September 23, 2026' }))
    await waitFor(() => { expect(trigger().textContent).toBe('Sep 23, 2026') })
    const fixed = vi.fn()
    render(<DatePicker aria-label="Fixed" value="2026-09-22" onValueChange={fixed} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fixed' }))
    await userEvent.click(within(await screen.findByRole('grid')).getByRole('button', { name: 'Thursday, September 24, 2026' }))
    expect(fixed.mock.calls).toEqual([['2026-09-24']])
    expect(screen.getByRole('button', { name: 'Fixed' }).textContent).toBe('Sep 22, 2026')
  })
})

describe('the month buttons', () => {
  it('next and previous move the month and keep the focus on the button; the title follows, politely', async () => {
    render(<CheckIn defaultValue="2026-09-22" />)
    await open()
    const next = screen.getByRole('button', { name: 'Next month' })
    await userEvent.click(next)
    expect(screen.getByRole('heading').textContent).toBe('October 2026')
    expect(screen.getByRole('heading').getAttribute('aria-live')).toBe('polite')
    expect(document.activeElement).toBe(next)
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('heading').textContent).toBe('August 2026')
  })

  it('previous is disabled in minDate\'s month and next in maxDate\'s', async () => {
    render(<CheckIn defaultValue="2026-09-30" minDate="2026-09-25" maxDate="2026-10-31" />)
    await open()
    expect(screen.getByRole('button', { name: 'Previous month' }).hasAttribute('disabled')).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByRole('button', { name: 'Next month' }).hasAttribute('disabled')).toBe(true)
  })

  it('with container inside a form, a press on next month does not submit it', async () => {
    const submitted = vi.fn((event: Event) => { event.preventDefault() })
    function InForm() {
      const [box, setBox] = useState(null as HTMLDivElement | null)
      return <form ref={(form) => { form?.addEventListener('submit', submitted) }}><div ref={setBox} />{box ? <CheckIn container={box} defaultValue="2026-09-22" /> : null}</form>
    }
    render(<InForm />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('dialog').closest('form')).not.toBeNull()
    expect(submitted).not.toHaveBeenCalled()
  })
})

describe('today', () => {
  it('is marked aria-current="date" and nothing else is; the calendar opens on it when nothing is chosen', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 15, 12) })
    try {
      render(<CheckIn />)
      const grid = await open()
      const today = within(grid).getByRole('button', { name: 'Thursday, October 15, 2026' })
      expect(today.getAttribute('aria-current')).toBe('date')
      expect(grid.querySelectorAll('[aria-current]')).toHaveLength(1)
      expect(today.tabIndex).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('clamped into the range when today is outside it', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 15, 12) })
    try {
      render(<CheckIn minDate="2027-01-10" maxDate="2027-03-31" />)
      const grid = await open()
      expect(screen.getByRole('heading').textContent).toBe('January 2027')
      expect(within(grid).getAllByRole('button').filter((b) => b.tabIndex === 0).map((b) => b.getAttribute('aria-label'))).toEqual(['Sunday, January 10, 2027'])
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('inside a FieldLive with a form action\'s error', () => {
  it('choosing a day clears the field\'s error', async () => {
    render(
      <form>
        <FormErrorsContext value={{ checkIn: 'Pick a later day' }}>
          <FieldLive name="checkIn" label="Check-in">{(control) => <DatePicker {...control} defaultValue="2026-09-22" />}</FieldLive>
        </FormErrorsContext>
      </form>,
    )
    expect(screen.getByText('Pick a later day')).toBeTruthy()
    await act(() => new Promise((done) => { setTimeout(done, 10) }))
    await userEvent.click(screen.getByRole('button', { name: 'Check-in' }))
    await userEvent.click(within(await screen.findByRole('grid')).getByRole('button', { name: 'Friday, September 25, 2026' }))
    await waitFor(() => { expect(screen.queryByText('Pick a later day')).toBeNull() })
    expect(screen.getByRole('button', { name: 'Check-in' }).getAttribute('aria-invalid')).toBeNull()
  })
})

describe('what reaches each element', () => {
  it('className merged last on the trigger; ref is the trigger; the root props never land on it as attributes', () => {
    const held = { current: null as HTMLButtonElement | null }
    render(<CheckIn className="justify-start" ref={held} defaultOpen={false} open={false} minDate="2026-01-01" firstDayOfWeek={1} placement="top" />)
    expect(trigger().className.split(' ').at(-1)).toBe('justify-start')
    expect(held.current).toBe(trigger())
    const names = [...trigger().attributes].map((a) => a.name)
    for (const name of ['open', 'defaultopen', 'mindate', 'firstdayofweek', 'placement', 'name', 'value']) expect(names, name).not.toContain(name)
  })

  it('the popup carries its placement and the scope the Escape guard looks for', async () => {
    render(<CheckIn placement="top-end" />)
    await open()
    const popup = screen.getByRole('dialog')
    expect(popup.getAttribute('data-placement')).toBe('top-end')
    expect(popup.getAttribute('data-overlay')).toMatch(/\S/)
  })

  it('disabled: a disabled button that opens nothing, and the form input is disabled too', async () => {
    const { container } = render(<CheckIn disabled defaultValue="2026-09-22" />)
    expect((trigger() as HTMLButtonElement).disabled).toBe(true)
    expect(hidden(container).disabled).toBe(true)
    await userEvent.click(trigger())
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('once hydrated, a focus on the form input (the browser\'s required check) goes to the trigger', () => {
    const { container } = render(<CheckIn required />)
    act(() => { hidden(container).focus() })
    expect(document.activeElement).toBe(trigger())
  })
})
