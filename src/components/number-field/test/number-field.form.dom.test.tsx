import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NumberField } from '../index.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
const field = () => screen.getByRole<HTMLInputElement>('textbox')
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>

describe('from the server HTML, before any script runs', () => {
  const served = (children: ReactNode) => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(children))
    document.body.appendChild(host)
    const sent = entries(formOf())
    host.remove()
    return sent
  }

  it('the plain number, never the formatted text, and name= when empty', () => {
    expect(served(<>
      <NumberField aria-label="A" name="price" defaultValue={1234.5} step="any" />
      <NumberField aria-label="B" name="arab" locale="ar-u-nu-arab" defaultValue={12} />
      <NumberField aria-label="C" name="empty" />
    </>)).toEqual([['price', '1234.5'], ['arab', '12'], ['empty', '']])
  })

  it('a default past max is sent clamped', () => {
    expect(served(<NumberField aria-label="A" name="guests" defaultValue={50} max={10} />)).toEqual([['guests', '10']])
  })

  it('a disabled field sends nothing, and a read-only one still sends', () => {
    expect(served(<><NumberField aria-label="A" name="a" disabled defaultValue={1} /><NumberField aria-label="B" name="b" readOnly defaultValue={2} /></>))
      .toEqual([['b', '2']])
  })

  it('a NaN bound or step is no bound and step 1, and a max under min is raised to it, so the form stays valid', () => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(<>
      <NumberField aria-label="A" name="a" defaultValue={5} min={Number.NaN} max={Number.NaN} step={Number.NaN} />
      <NumberField aria-label="B" name="b" defaultValue={5} min={10} max={2} />
    </>))
    document.body.appendChild(host)
    const hidden = [...host.querySelectorAll<HTMLInputElement>('input[type="number"]')]
    expect(hidden.map((el) => [el.value, el.getAttribute('min'), el.getAttribute('max'), el.getAttribute('step')]))
      .toEqual([['5', null, null, '1'], ['10', '10', '10', '1']])
    expect(formOf().checkValidity()).toBe(true)
    host.remove()
  })

  it('a field without a name sends nothing', () => {
    expect(served(<NumberField aria-label="A" defaultValue={1} />)).toEqual([])
  })
})

describe('after a change', () => {
  it('the form sends what the screen shows, and name= once it is cleared', async () => {
    render(inForm(<NumberField aria-label="A" name="guests" defaultValue={2} />))
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(entries(formOf())).toEqual([['guests', '3']])
    await userEvent.clear(field())
    expect(entries(formOf())).toEqual([['guests', '']])
  })

  it('a Latin 1,234 typed under Arabic-Indic digits and sent with Enter, still focused, sends 1234 and not 1', async () => {
    const sent = vi.fn()
    render(<form onSubmit={(event) => { event.preventDefault(); sent(entries(event.currentTarget)) }}>
      <NumberField aria-label="A" name="guests" locale="ar-u-nu-arab" /><button type="submit">Send</button>
    </form>)
    await userEvent.type(field(), '1,234{Enter}')
    expect(sent.mock.calls).toEqual([[[['guests', '1234']]]])
    expect(document.activeElement).toBe(field())
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<NumberField aria-label="A" name="guests" defaultValue={2} onValueChange={onValueChange} />))
      await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
      expect(entries(formOf())).toEqual([['guests', '3']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(field().value).toBe('2')
      expect(entries(formOf())).toEqual([['guests', '2']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a number typed and still focused goes back too, stays back after a blur, and calls no onValueChange', async () => {
    const onValueChange = vi.fn((next: number | null) => next)
    render(inForm(<NumberField aria-label="A" name="guests" defaultValue={2} onValueChange={onValueChange} />))
    await userEvent.type(field(), '7')
    expect(entries(formOf())).toEqual([['guests', '27']])
    act(() => { formOf().reset() })
    await settle()
    expect([field().value, document.activeElement === field()]).toEqual(['2', true])
    act(() => { field().blur() })
    expect(entries(formOf())).toEqual([['guests', '2']])
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([27])
  })

  it('an empty field goes back to empty', async () => {
    render(inForm(<NumberField aria-label="A" name="guests" />))
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    act(() => { formOf().reset() })
    await settle()
    expect(field().value).toBe('')
    expect(entries(formOf())).toEqual([['guests', '']])
  })

  it('to the default of the latest render, clamped, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<NumberField aria-label="A" name="guests" defaultValue={2} max={10} />))
    rerender(inForm(<NumberField aria-label="A" name="guests" defaultValue={50} max={10} />))
    expect(field().value).toBe('2')
    act(() => { formOf().reset() })
    await settle()
    expect(field().value).toBe('10')
    expect(entries(formOf())).toEqual([['guests', '10']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  it('a controlled field keeps its owner\'s value', async () => {
    function Owner() {
      const [count, setCount] = useState<number | null>(2)
      return inForm(<NumberField aria-label="A" name="guests" value={count} onValueChange={setCount} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    act(() => { formOf().reset() })
    await settle()
    expect(field().value).toBe('3')
    expect(entries(formOf())).toEqual([['guests', '3']])
  })

  it('a field outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><NumberField aria-label="A" name="far" form="f" defaultValue={1} /></>)
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(entries(formOf())).toEqual([['far', '2']])
    act(() => { formOf().reset() })
    await settle()
    expect(field().value).toBe('1')
    expect(entries(formOf())).toEqual([['far', '1']])
  })
})
