import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DatePicker } from '../index.js'
import type { DatePickerProps } from '../types.js'

// What the form receives: an ISO date, before hydration, after a choice and after a reset. The browser spec repeats it.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const shown = () => screen.getAllByRole('button', { name: /^Check-in/ }).map((one) => one.textContent)

function CheckIn(props: Partial<DatePickerProps>) {
  return <DatePicker aria-label="Check-in" name="checkIn" {...props} />
}

async function choose(name: string, at = 0) {
  await userEvent.click(screen.getAllByRole('button', { name: /^Check-in/ })[at] as HTMLElement)
  await userEvent.click(within(await screen.findByRole('grid')).getByRole('button', { name }))
  await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
}

describe('from the server HTML, before any script runs', () => {
  const served = (children: ReactNode) => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(children))
    document.body.appendChild(host)
    const sent = entries(formOf())
    host.remove()
    return sent
  }

  it('the default sends name=YYYY-MM-DD, nothing chosen sends name=, and a string that is no day sends name=', () => {
    expect(served(<><CheckIn defaultValue="2026-10-02" /><CheckIn name="out" /><CheckIn name="bad" defaultValue="2026-02-30" /></>))
      .toEqual([['checkIn', '2026-10-02'], ['out', ''], ['bad', '']])
  })

  it('a value outside the range is sent as given; a disabled one sends nothing, and one with no name nothing', () => {
    expect(served(<>
      <CheckIn defaultValue="2030-01-01" maxDate="2027-03-31" />
      <CheckIn name="off" disabled defaultValue="2026-10-02" />
      <DatePicker aria-label="Unnamed" defaultValue="2026-10-02" />
    </>)).toEqual([['checkIn', '2030-01-01']])
  })

  it('required with nothing chosen fails the browser\'s check on the form input, and passes once it holds a day', () => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(<CheckIn required />))
    document.body.appendChild(host)
    expect(formOf().checkValidity()).toBe(false)
    host.innerHTML = renderToString(inForm(<CheckIn required defaultValue="2026-10-02" />))
    expect(formOf().checkValidity()).toBe(true)
    host.remove()
  })
})

describe('after a choice', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<CheckIn defaultValue="2026-09-22" />))
    await choose('Friday, September 25, 2026')
    expect(entries(formOf())).toEqual([['checkIn', '2026-09-25']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<CheckIn defaultValue="2026-09-22" onValueChange={onValueChange} />))
      await choose('Friday, September 25, 2026')
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(shown()).toEqual(['Sep 22, 2026'])
      expect(entries(formOf())).toEqual([['checkIn', '2026-09-22']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('one with no default goes back to the placeholder, and sends name=', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 8, 20, 12) })
    try {
      render(inForm(<CheckIn />))
      await choose('Friday, September 25, 2026')
      act(() => { formOf().reset() })
      await settle()
      expect(shown()).toEqual(['Pick a date'])
      expect(entries(formOf())).toEqual([['checkIn', '']])
    } finally {
      vi.useRealTimers()
    }
  })

  it('to the default of the latest render', async () => {
    const { rerender } = render(inForm(<CheckIn defaultValue="2026-09-22" />))
    rerender(inForm(<CheckIn defaultValue="2026-10-02" />))
    expect(shown()).toEqual(['Sep 22, 2026'])
    act(() => { formOf().reset() })
    await settle()
    expect(entries(formOf())).toEqual([['checkIn', '2026-10-02']])
  })

  it('a controlled one keeps its owner\'s value, and one outside the form tied to it by form follows its reset', async () => {
    function Owner() {
      const [value, setValue] = useState<string | null>('2026-09-22')
      return <><form id="f"><CheckIn value={value} onValueChange={setValue} /></form><CheckIn name="far" form="f" defaultValue="2026-09-22" /></>
    }
    render(<Owner />)
    await choose('Friday, September 25, 2026', 0)
    await choose('Wednesday, September 23, 2026', 1)
    expect(entries(formOf())).toEqual([['checkIn', '2026-09-25'], ['far', '2026-09-23']])
    act(() => { formOf().reset() })
    await settle()
    expect(entries(formOf())).toEqual([['checkIn', '2026-09-25'], ['far', '2026-09-22']])
  })
})
