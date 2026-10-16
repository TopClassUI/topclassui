import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from '../index.js'

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

  it('ticked sends name=on, unticked sends nothing, and an indeterminate box sends nothing', () => {
    expect(served(<><Checkbox aria-label="A" name="terms" defaultChecked /><Checkbox aria-label="B" name="news" /><Checkbox aria-label="C" name="all" indeterminate /></>))
      .toEqual([['terms', 'on']])
  })

  it('value replaces on, and uncheckedValue is sent while it is unticked', () => {
    expect(served(<><Checkbox aria-label="A" name="a" value="yes" defaultChecked /><Checkbox aria-label="B" name="b" uncheckedValue="no" /></>))
      .toEqual([['a', 'yes'], ['b', 'no']])
  })

  it('a mixed box sends nothing before any script runs, checked by default or with an uncheckedValue', () => {
    expect(served(<><Checkbox aria-label="A" name="a" indeterminate defaultChecked /><Checkbox aria-label="B" name="b" indeterminate uncheckedValue="no" /></>))
      .toEqual([])
  })

  it('a disabled box sends nothing, and a read-only one still sends', () => {
    expect(served(<><Checkbox aria-label="A" name="a" disabled defaultChecked /><Checkbox aria-label="B" name="b" readOnly defaultChecked /></>))
      .toEqual([['b', 'on']])
  })
})

describe('after a press', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<Checkbox aria-label="A" name="terms" />))
    expect(entries(formOf())).toEqual([])
    await userEvent.click(screen.getByRole('checkbox'))
    expect(entries(formOf())).toEqual([['terms', 'on']])
  })

  it('an uncheckedValue box swaps its two values', async () => {
    render(inForm(<Checkbox aria-label="A" name="news" uncheckedValue="no" />))
    expect(entries(formOf())).toEqual([['news', 'no']])
    await userEvent.click(screen.getByRole('checkbox'))
    expect(entries(formOf())).toEqual([['news', 'on']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onCheckedChange`, async () => {
      const onCheckedChange = vi.fn()
      render(inForm(<Checkbox aria-label="A" name="terms" defaultChecked onCheckedChange={onCheckedChange} />))
      await userEvent.click(screen.getByRole('checkbox'))
      expect(entries(formOf())).toEqual([])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true')
      expect(entries(formOf())).toEqual([['terms', 'on']])
      expect(onCheckedChange).toHaveBeenCalledTimes(1)
    })
  }

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Checkbox aria-label="A" name="terms" />))
    rerender(inForm(<Checkbox aria-label="A" name="terms" defaultChecked />))
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false')
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true')
    expect(entries(formOf())).toEqual([['terms', 'on']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  it('a controlled box keeps its owner\'s value, and its hidden checkbox agrees with it', async () => {
    function Owner() {
      const [on, setOn] = useState(false)
      return inForm(<Checkbox aria-label="A" name="terms" checked={on} onCheckedChange={setOn} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('checkbox'))
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true')
    expect(entries(formOf())).toEqual([['terms', 'on']])
  })

  it('a box outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Checkbox aria-label="A" name="far" form="f" /></>)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(entries(formOf())).toEqual([['far', 'on']])
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false')
    expect(entries(formOf())).toEqual([])
  })

  it('a mixed box sends nothing however often it is pressed, through a reset too, and sends its value once the dash goes', async () => {
    const { rerender } = render(inForm(<Checkbox aria-label="A" name="all" indeterminate />))
    for (const press of ['first', 'second']) {
      await userEvent.click(screen.getByRole('checkbox'))
      expect(screen.getByRole('checkbox').getAttribute('aria-checked'), press).toBe('mixed')
      expect(entries(formOf()), press).toEqual([])
    }
    act(() => { formOf().reset() })
    await settle()
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('mixed')
    expect(entries(formOf())).toEqual([])
    await userEvent.click(screen.getByRole('checkbox'))
    rerender(inForm(<Checkbox aria-label="A" name="all" />))
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true')
    expect(entries(formOf())).toEqual([['all', 'on']])
  })

  it('a mixed box that is checked by default, or has an uncheckedValue, sends nothing either, and a reset keeps it so', async () => {
    render(inForm(<><Checkbox aria-label="A" name="a" indeterminate defaultChecked /><Checkbox aria-label="B" name="b" indeterminate uncheckedValue="no" /></>))
    expect(entries(formOf())).toEqual([])
    act(() => { formOf().reset() })
    await settle()
    expect(entries(formOf())).toEqual([])
  })
})
