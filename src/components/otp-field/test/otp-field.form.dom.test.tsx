import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OTPField, type OtpFieldProps } from '../index.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const shown = () => [...screen.getByRole('group').querySelectorAll('input')].map((one) => one.value).join('')
const cell = (name = 'Code') => screen.getByRole('textbox', { name })

function Code(props: Partial<OtpFieldProps>) {
  return <><span id="code-label">Code</span><OTPField aria-labelledby="code-label" name="code" length={4} {...props as OtpFieldProps} /></>
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

  it('an empty field sends name=, a default sends itself, and a field with no name sends nothing', () => {
    expect(served(<><Code /><Code name="other" defaultValue="48" /><OTPField id="none" /></>)).toEqual([['code', ''], ['other', '48']])
  })

  it('a disabled field sends nothing, and a read-only one still sends', () => {
    expect(served(<><Code disabled defaultValue="1" /><Code name="kept" readOnly defaultValue="12" /></>)).toEqual([['kept', '12']])
  })
})

describe('after typing', () => {
  it('the form sends what is typed so far, a partial code too', async () => {
    render(inForm(<Code />))
    await userEvent.click(cell())
    await userEvent.keyboard('48')
    expect(entries(formOf())).toEqual([['code', '48']])
    await userEvent.keyboard('21')
    expect(entries(formOf())).toEqual([['code', '4821']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<Code defaultValue="12" onValueChange={onValueChange} />))
      await userEvent.click(screen.getByRole('textbox', { name: 'Character 3 of 4' }))
      await userEvent.keyboard('9')
      expect(entries(formOf())).toEqual([['code', '129']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(shown()).toBe('12')
      expect(entries(formOf())).toEqual([['code', '12']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a field with no default goes back to empty, and sends name=', async () => {
    render(inForm(<Code />))
    await userEvent.click(cell())
    await userEvent.keyboard('77')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toBe('')
    expect(entries(formOf())).toEqual([['code', '']])
  })

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Code defaultValue="11" />))
    rerender(inForm(<Code defaultValue="22" />))
    expect(shown()).toBe('11')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toBe('22')
    expect(entries(formOf())).toEqual([['code', '22']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  it('a controlled field keeps its owner\'s value, on screen and in the form', async () => {
    function Owner() {
      const [value, setValue] = useState('12')
      return inForm(<Code value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await userEvent.click(screen.getByRole('textbox', { name: 'Character 3 of 4' }))
    await userEvent.keyboard('3')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toBe('123')
    expect(entries(formOf())).toEqual([['code', '123']])
  })

  it('a field outside the form, tied to it by form, is sent with it and follows its reset', async () => {
    render(<><form id="f" /><Code name="far" form="f" defaultValue="5" /></>)
    await userEvent.click(screen.getByRole('textbox', { name: 'Character 2 of 4' }))
    await userEvent.keyboard('6')
    expect(entries(formOf())).toEqual([['far', '56']])
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toBe('5')
    expect(entries(formOf())).toEqual([['far', '5']])
  })
})

describe('autoSubmit sends the field\'s own form, whatever else is on the page', () => {
  const sent: [string, (string | undefined)[][]][] = []
  const record = (event: { preventDefault: () => void, currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    sent.push([event.currentTarget.id, entries(event.currentTarget)])
  }
  afterEach(() => { sent.length = 0 })

  it('with another field mounted after it in a second form, only its own form is sent, with the code', async () => {
    render(<>
      <form id="a" onSubmit={record}><OTPField aria-labelledby="a" name="a" length={4} autoSubmit /></form>
      <form id="b" onSubmit={record}><OTPField aria-labelledby="b" name="b" length={4} /></form>
    </>)
    await userEvent.click(screen.getAllByRole('textbox')[0] as HTMLElement)
    await userEvent.keyboard('4321')
    expect(sent).toEqual([['a', [['a', '4321']]]])
  })

  it('tied to a form by form, it sends that form; without autoSubmit a full code sends nothing', async () => {
    render(<>
      <form id="far" onSubmit={record} />
      <OTPField aria-labelledby="x" name="x" form="far" length={2} autoSubmit />
      <form id="still" onSubmit={record}><OTPField aria-labelledby="y" name="y" length={2} /></form>
    </>)
    const [x, , y] = screen.getAllByRole('textbox')
    await userEvent.click(x as HTMLElement)
    await userEvent.keyboard('12')
    await userEvent.click(y as HTMLElement)
    await userEvent.keyboard('34')
    expect(sent).toEqual([['far', [['x', '12']]]])
  })
})
