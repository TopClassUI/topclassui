import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const states = () => screen.getAllByRole('radio').map((one) => one.getAttribute('aria-checked'))

type Props = Partial<Parameters<typeof SegmentedControlRoot>[0]>

function View(props: Props) {
  return (
    <SegmentedControlRoot aria-label="View" name="view" defaultValue="board" {...props}>
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="table">Table</SegmentedControlItem>
      <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
    </SegmentedControlRoot>
  )
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

  it('the default sends name=value, and a track with no name sends nothing', () => {
    expect(served(<><View defaultValue="table" /><View name={undefined} /></>)).toEqual([['view', 'table']])
  })

  it('a disabled track sends nothing, a read-only one still sends, and a disabled selected segment sends nothing', () => {
    expect(served(<>
      <View disabled />
      <View name="kept" readOnly defaultValue="calendar" />
      <SegmentedControlRoot aria-label="Items" name="items" defaultValue="x">
        <SegmentedControlItem value="x" disabled>X</SegmentedControlItem>
        <SegmentedControlItem value="y">Y</SegmentedControlItem>
      </SegmentedControlRoot>
    </>)).toEqual([['kept', 'calendar']])
  })
})

describe('after a press', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<View />))
    expect(entries(formOf())).toEqual([['view', 'board']])
    await userEvent.click(screen.getByRole('radio', { name: 'Table' }))
    expect(entries(formOf())).toEqual([['view', 'table']])
    await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }))
    expect(entries(formOf())).toEqual([['view', 'calendar']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<View defaultValue="table" onValueChange={onValueChange} />))
      await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
      expect(entries(formOf())).toEqual([['view', 'board']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(states()).toEqual(['false', 'true', 'false'])
      expect(entries(formOf())).toEqual([['view', 'table']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<View defaultValue="board" />))
    rerender(inForm(<View defaultValue="table" />))
    expect(states()).toEqual(['true', 'false', 'false'])
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['false', 'true', 'false'])
    expect(entries(formOf())).toEqual([['view', 'table']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  // The owner's value is not the last segment: a sync that checked every input would leave the last one checked.
  it('a controlled track keeps its owner\'s value, and its radio inputs agree with it', async () => {
    function Owner() {
      const [value, setValue] = useState('calendar')
      return inForm(<View value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('radio', { name: 'Table' }))
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['false', 'true', 'false'])
    expect(entries(formOf())).toEqual([['view', 'table']])
  })

  it('a track outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><View name="far" form="f" /></>)
    await userEvent.click(screen.getByRole('radio', { name: 'Table' }))
    expect(entries(formOf())).toEqual([['far', 'table']])
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(entries(formOf())).toEqual([['far', 'board']])
  })
})
