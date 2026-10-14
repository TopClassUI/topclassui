import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Switch } from '../index.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
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

  it('on sends name=on, off sends nothing', () => {
    expect(served(<><Switch aria-label="A" name="digest" defaultChecked /><Switch aria-label="B" name="news" /></>))
      .toEqual([['digest', 'on']])
  })

  it('value replaces on, and uncheckedValue is sent while it is off', () => {
    expect(served(<><Switch aria-label="A" name="a" value="yes" defaultChecked /><Switch aria-label="B" name="b" uncheckedValue="no" /></>))
      .toEqual([['a', 'yes'], ['b', 'no']])
  })

  it('a disabled switch sends nothing, and a read-only one still sends', () => {
    expect(served(<><Switch aria-label="A" name="a" disabled defaultChecked /><Switch aria-label="B" name="b" readOnly defaultChecked /></>))
      .toEqual([['b', 'on']])
  })
})

describe('after a press', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<Switch aria-label="A" name="digest" />))
    expect(entries(formOf())).toEqual([])
    await userEvent.click(screen.getByRole('switch'))
    expect(entries(formOf())).toEqual([['digest', 'on']])
  })

  it('an uncheckedValue switch swaps its two values', async () => {
    render(inForm(<Switch aria-label="A" name="news" uncheckedValue="no" />))
    expect(entries(formOf())).toEqual([['news', 'no']])
    await userEvent.click(screen.getByRole('switch'))
    expect(entries(formOf())).toEqual([['news', 'on']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onCheckedChange`, async () => {
      const onCheckedChange = vi.fn()
      render(inForm(<Switch aria-label="A" name="digest" defaultChecked onCheckedChange={onCheckedChange} />))
      await userEvent.click(screen.getByRole('switch'))
      expect(entries(formOf())).toEqual([])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
      expect(entries(formOf())).toEqual([['digest', 'on']])
      expect(onCheckedChange).toHaveBeenCalledTimes(1)
    })
  }

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Switch aria-label="A" name="digest" />))
    rerender(inForm(<Switch aria-label="A" name="digest" defaultChecked />))
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
    expect(entries(formOf())).toEqual([['digest', 'on']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  it('a controlled switch keeps its owner\'s value, and its hidden checkbox agrees with it', async () => {
    function Owner() {
      const [on, setOn] = useState(false)
      return inForm(<Switch aria-label="A" name="digest" checked={on} onCheckedChange={setOn} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('switch'))
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
    expect(entries(formOf())).toEqual([['digest', 'on']])
  })

  it('a switch outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Switch aria-label="A" name="far" form="f" /></>)
    await userEvent.click(screen.getByRole('switch'))
    expect(entries(formOf())).toEqual([['far', 'on']])
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
    expect(entries(formOf())).toEqual([])
  })
})
