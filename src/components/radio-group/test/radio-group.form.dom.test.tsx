import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import { useChromiumLabels } from './chromium-labels.js'

useChromiumLabels()

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const states = () => screen.getAllByRole('radio').map((one) => one.getAttribute('aria-checked'))

function Plan(props: Partial<Parameters<typeof RadioGroupRoot>[0]>) {
  return (
    <RadioGroupRoot aria-label="Plan" name="plan" {...props}>
      <RadioGroupItem value="free">Free</RadioGroupItem>
      <RadioGroupItem value="pro">Pro</RadioGroupItem>
    </RadioGroupRoot>
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

  it('the default sends name=value, and a group with none checked sends nothing', () => {
    expect(served(<><Plan defaultValue="pro" /><Plan name="other" /></>)).toEqual([['plan', 'pro']])
  })

  it('a disabled group sends nothing, a read-only one still sends, and a disabled checked item sends nothing', () => {
    const items = <><RadioGroupItem value="x" disabled>X</RadioGroupItem><RadioGroupItem value="y">Y</RadioGroupItem></>
    expect(served(<>
      <Plan disabled defaultValue="pro" />
      <Plan name="kept" readOnly defaultValue="free" />
      <RadioGroupRoot aria-label="Items" name="items" defaultValue="x">{items}</RadioGroupRoot>
    </>)).toEqual([['kept', 'free']])
  })
})

describe('after a press', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<Plan />))
    expect(entries(formOf())).toEqual([])
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }))
    expect(entries(formOf())).toEqual([['plan', 'pro']])
    await userEvent.click(screen.getByRole('radio', { name: 'Free' }))
    expect(entries(formOf())).toEqual([['plan', 'free']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<Plan defaultValue="pro" onValueChange={onValueChange} />))
      await userEvent.click(screen.getByRole('radio', { name: 'Free' }))
      expect(entries(formOf())).toEqual([['plan', 'free']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(states()).toEqual(['false', 'true'])
      expect(entries(formOf())).toEqual([['plan', 'pro']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a group with no default goes back to none checked, and sends nothing', async () => {
    render(inForm(<Plan />))
    await userEvent.click(screen.getByRole('radio', { name: 'Free' }))
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['false', 'false'])
    expect(entries(formOf())).toEqual([])
  })

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Plan defaultValue="free" />))
    rerender(inForm(<Plan defaultValue="pro" />))
    expect(states()).toEqual(['true', 'false'])
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['false', 'true'])
    expect(entries(formOf())).toEqual([['plan', 'pro']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  // The owner's value is the first radio: a sync that checked every input would leave the last one checked.
  it('a controlled group keeps its owner\'s value, and its radio inputs agree with it', async () => {
    function Owner() {
      const [value, setValue] = useState('pro')
      return inForm(<Plan value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('radio', { name: 'Free' }))
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['true', 'false'])
    expect(entries(formOf())).toEqual([['plan', 'free']])
  })

  it('a group outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Plan name="far" form="f" defaultValue="free" /></>)
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }))
    expect(entries(formOf())).toEqual([['far', 'pro']])
    act(() => { formOf().reset() })
    await settle()
    expect(states()).toEqual(['true', 'false'])
    expect(entries(formOf())).toEqual([['far', 'free']])
  })
})
