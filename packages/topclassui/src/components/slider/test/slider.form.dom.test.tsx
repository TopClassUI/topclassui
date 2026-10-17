import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Slider } from '../index.js'

// What the form receives (unit-4.md, "What the form receives" and "A form reset"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>
const values = () => screen.getAllByRole('slider').map((input) => input.getAttribute('aria-valuenow'))
const press = async (key: string, name = 'Volume') => { screen.getByRole('slider', { name }).focus(); await userEvent.keyboard(key) }

describe('from the server HTML, before any script runs', () => {
  const served = (children: ReactNode) => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(children))
    document.body.appendChild(host)
    const sent = entries(formOf())
    host.remove()
    return sent
  }

  it('name=<value>; the minimum when no default is given; the name twice for a range', () => {
    expect(served(<>
      <Slider aria-label="Volume" name="volume" defaultValue={60} />
      <Slider aria-label="Floor" name="floor" min={10} />
      <Slider aria-label="Price" name="price" defaultValue={[20, 80]} />
    </>)).toEqual([['volume', '60'], ['floor', '10'], ['price', '20'], ['price', '80']])
  })

  it('a disabled slider sends nothing, and one with no name sends nothing', () => {
    expect(served(<>
      <Slider aria-label="Off" name="off" disabled defaultValue={5} />
      <Slider aria-label="Nameless" defaultValue={5} />
    </>)).toEqual([])
  })
})

describe('after a key', () => {
  it('the form sends what the screen shows, for one thumb and for each of two', async () => {
    render(inForm(<>
      <Slider aria-label="Volume" name="volume" defaultValue={60} />
      <Slider aria-label="Price" name="price" defaultValue={[20, 80]} />
    </>))
    await press('{PageUp}')
    await press('{Home}', 'Maximum')
    expect(entries(formOf())).toEqual([['volume', '70'], ['price', '20'], ['price', '20']])
  })
})

describe('a reset brings it back to its default, on screen and in the form', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    it(`after ${how}, for one thumb and a range, and it calls no onValueChange`, async () => {
      const onValueChange = vi.fn()
      render(inForm(<>
        <Slider aria-label="Volume" name="volume" defaultValue={60} onValueChange={onValueChange} />
        <Slider aria-label="Price" name="price" defaultValue={[20, 80]} />
      </>))
      await press('{End}')
      await press('{End}', 'Minimum')
      expect(entries(formOf())).toEqual([['volume', '100'], ['price', '80'], ['price', '80']])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect(values()).toEqual(['60', '20', '80'])
      expect(entries(formOf())).toEqual([['volume', '60'], ['price', '20'], ['price', '80']])
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  }

  it('a slider with no default goes back to min', async () => {
    render(inForm(<Slider aria-label="Volume" name="volume" min={5} />))
    await press('{End}')
    act(() => { formOf().reset() })
    await settle()
    expect(entries(formOf())).toEqual([['volume', '5']])
  })

  it('to the default of the latest render, with no warning about a changing default', async () => {
    const warned = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const { rerender } = render(inForm(<Slider aria-label="Volume" name="volume" defaultValue={10} />))
    rerender(inForm(<Slider aria-label="Volume" name="volume" defaultValue={40} />))
    expect(values()).toEqual(['10'])
    act(() => { formOf().reset() })
    await settle()
    expect(values()).toEqual(['40'])
    expect(entries(formOf())).toEqual([['volume', '40']])
    expect(warned.flatMap((spy) => spy.mock.calls)).toEqual([])
  })

  it('a controlled slider keeps its owner\'s value, and its input agrees with it', async () => {
    function Owner() {
      const [value, setValue] = useState(30)
      return inForm(<Slider aria-label="Volume" name="volume" value={value} onValueChange={setValue} />)
    }
    render(<Owner />)
    await press('{PageUp}')
    act(() => { formOf().reset() })
    await settle()
    expect(values()).toEqual(['40'])
    expect(entries(formOf())).toEqual([['volume', '40']])
  })

  it('a slider outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><Slider aria-label="Volume" name="far" form="f" defaultValue={25} /></>)
    await press('{End}')
    expect(entries(formOf())).toEqual([['far', '100']])
    act(() => { formOf().reset() })
    await settle()
    expect(values()).toEqual(['25'])
    expect(entries(formOf())).toEqual([['far', '25']])
  })
})
