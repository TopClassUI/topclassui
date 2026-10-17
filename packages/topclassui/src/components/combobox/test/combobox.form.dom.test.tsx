import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Combobox } from '../index.js'
import type { ComboboxProps } from '../types.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const ITEMS = [{ value: 'next', label: 'Next.js' }, { value: 'astro', label: 'Astro' }, { value: 'remix', label: 'Remix' }]

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const shown = () => screen.getAllByRole('combobox').map((one) => (one as HTMLInputElement).value)

function Framework(props: Partial<ComboboxProps>) {
  return <Combobox aria-label="Framework" name="framework" items={ITEMS} {...props} />
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
    expect(served(<><Framework defaultValue="astro" /><Framework name="other" /></>)).toEqual([['framework', 'astro'], ['other', '']])
  })

  it('a disabled Combobox sends nothing, a read-only one still sends, and one with no name sends nothing', () => {
    expect(served(<>
      <Framework disabled defaultValue="astro" />
      <Framework name="kept" readOnly defaultValue="remix" />
      <Combobox aria-label="Unnamed" items={ITEMS} defaultValue="next" />
    </>)).toEqual([['kept', 'remix']])
  })
})

describe('after a choice', () => {
  it('the form sends what the screen shows', async () => {
    render(inForm(<Framework />))
    expect(entries(formOf())).toEqual([['framework', '']])
    await choose('Astro')
    expect(entries(formOf())).toEqual([['framework', 'astro']])
  })

  it('text typed with nothing chosen is not sent', async () => {
    render(inForm(<Framework />))
    await userEvent.type(screen.getByRole('combobox'), 'Ast')
    expect(entries(formOf())).toEqual([['framework', '']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<Framework defaultValue="astro" onValueChange={onValueChange} />))
      await choose('Next.js')
      expect(entries(formOf())).toEqual([['framework', 'next']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(shown()).toEqual(['Astro'])
      expect(entries(formOf())).toEqual([['framework', 'astro']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a Combobox with no default goes back to empty, and sends name=', async () => {
    render(inForm(<Framework />))
    await choose('Astro')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual([''])
    expect(entries(formOf())).toEqual([['framework', '']])
  })

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Framework defaultValue="next" />))
    rerender(inForm(<Framework defaultValue="astro" />))
    expect(shown()).toEqual(['Next.js'])
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Astro'])
    expect(entries(formOf())).toEqual([['framework', 'astro']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  // The owner's value is the first option: a reset that wrote the last option would send that.
  it('a controlled Combobox keeps its owner\'s value, on screen and in the form', async () => {
    function Owner() {
      const [value, setValue] = useState<string | null>('astro')
      return inForm(<Framework value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await choose('Next.js')
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Next.js'])
    expect(entries(formOf())).toEqual([['framework', 'next']])
  })

  it('a Combobox outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Framework name="far" form="f" defaultValue="next" /></>)
    await choose('Astro')
    expect(entries(formOf())).toEqual([['far', 'astro']])
    act(() => { formOf().reset() })
    await settle()
    expect(shown()).toEqual(['Next.js'])
    expect(entries(formOf())).toEqual([['far', 'next']])
  })
})
