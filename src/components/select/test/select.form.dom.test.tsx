import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Select } from '../index.js'
import type { SelectProps } from '../types.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const shown = () => screen.getAllByRole('combobox').map((one) => one.textContent)

function Country(props: Partial<SelectProps>) {
  return <Select aria-label="Country" name="country" items={ITEMS} {...props} />
}

async function choose(label: string, at = 0) {
  await userEvent.click(screen.getAllByRole('combobox')[at] as HTMLElement)
  await userEvent.click(await screen.findByRole('option', { name: label }))
  await waitFor(() => { expect(screen.queryByRole('listbox')).toBeNull() })
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

  it('the default sends name=value, and nothing chosen sends name=', () => {
    expect(served(<><Country defaultValue="eg" /><Country name="other" /></>)).toEqual([['country', 'eg'], ['other', '']])
  })

  it('a disabled Select sends nothing, a read-only one still sends, and one with no name sends nothing', () => {
    expect(served(<>
      <Country disabled defaultValue="eg" />
      <Country name="kept" readOnly defaultValue="ma" />
      <Select aria-label="Unnamed" items={ITEMS} defaultValue="jo" />
    </>)).toEqual([['kept', 'ma']])
  })
})

describe('after a choice', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<Country />))
    expect(entries(formOf())).toEqual([['country', '']])
    await choose('Egypt')
    expect(entries(formOf())).toEqual([['country', 'eg']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<Country defaultValue="eg" onValueChange={onValueChange} />))
      await choose('Jordan')
      expect(entries(formOf())).toEqual([['country', 'jo']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(shown()).toEqual(['Egypt'])
      expect(entries(formOf())).toEqual([['country', 'eg']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a Select with no default goes back to the placeholder, and sends name=', async () => {
    render(inForm(<Country />))
    await choose('Egypt')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Select'])
    expect(entries(formOf())).toEqual([['country', '']])
  })

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Country defaultValue="jo" />))
    rerender(inForm(<Country defaultValue="eg" />))
    expect(shown()).toEqual(['Jordan'])
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Egypt'])
    expect(entries(formOf())).toEqual([['country', 'eg']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  // The owner's value is the first option: a reset that wrote the last option would send that.
  it('a controlled Select keeps its owner\'s value, on screen and in the form', async () => {
    function Owner() {
      const [value, setValue] = useState<string | null>('eg')
      return inForm(<Country value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await choose('Jordan')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Jordan'])
    expect(entries(formOf())).toEqual([['country', 'jo']])
  })

  it('a Select outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Country name="far" form="f" defaultValue="jo" /></>)
    await choose('Egypt')
    expect(entries(formOf())).toEqual([['far', 'eg']])
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Jordan'])
    expect(entries(formOf())).toEqual([['far', 'jo']])
  })
})
