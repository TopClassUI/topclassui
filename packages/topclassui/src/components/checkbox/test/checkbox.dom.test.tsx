import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from '../index.js'

const theBox = () => screen.getByRole('checkbox')
const hidden = (container: HTMLElement) => container.querySelector('input[type="checkbox"]') as HTMLInputElement
/** The path of the svg drawn inside the box: the tick, the dash, or none. */
const mark = (container: HTMLElement) => {
  const d = container.querySelector('svg path')?.getAttribute('d') ?? ''
  return d.startsWith('M229.66') ? 'tick' : d.startsWith('M224,128') ? 'dash' : 'none'
}

describe('a press toggles it once, with Base UI\'s details', () => {
  it('a click calls onCheckedChange once, with true and details whose reason is none', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Terms" onCheckedChange={onCheckedChange} />)
    await userEvent.click(theBox())
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
    expect(onCheckedChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'none', isCanceled: false })
    expect(theBox().getAttribute('aria-checked')).toBe('true')
  })

  it('uncontrolled: it starts at defaultChecked, the hidden checkbox follows each press, and the tick comes and goes', async () => {
    const { container } = render(<Checkbox aria-label="Terms" defaultChecked />)
    expect(theBox().getAttribute('aria-checked')).toBe('true')
    expect(hidden(container).checked).toBe(true)
    expect(mark(container)).toBe('tick')
    await userEvent.click(theBox())
    expect(theBox().getAttribute('aria-checked')).toBe('false')
    expect(hidden(container).checked).toBe(false)
    expect(theBox().hasAttribute('data-unchecked')).toBe(true)
    expect(mark(container)).toBe('none')
  })

  it('a handler that calls details.cancel() leaves the box as it was, on screen and in the input', async () => {
    const { container } = render(<Checkbox aria-label="Terms" onCheckedChange={(_next, details) => { details.cancel() }} />)
    await userEvent.click(theBox())
    expect(theBox().getAttribute('aria-checked')).toBe('false')
    expect(hidden(container).checked).toBe(false)
  })
})

describe('indeterminate', () => {
  it('draws the dash and says mixed, and a press asks for the opposite of checked while the box stays mixed', async () => {
    const onCheckedChange = vi.fn((next: boolean) => next)
    const { container } = render(<Checkbox aria-label="All" name="all" indeterminate onCheckedChange={onCheckedChange} />)
    expect(theBox().getAttribute('aria-checked')).toBe('mixed')
    expect(mark(container)).toBe('dash')
    expect(hidden(container).indeterminate).toBe(true)
    await userEvent.click(theBox())
    expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true])
    expect(theBox().getAttribute('aria-checked')).toBe('mixed')
    expect(mark(container)).toBe('dash')
    // unit-4.md, "What the form receives": a mixed box sends nothing, so its hidden input stays unticked.
    expect(hidden(container).checked).toBe(false)
  })

  it('a parent that clears indeterminate on change turns the dash into a tick', async () => {
    function Parent() {
      const [state, setState] = useState({ all: false, some: true })
      return <Checkbox aria-label="All" checked={state.all} indeterminate={state.some && !state.all} onCheckedChange={(all) => { setState({ all, some: all }) }} />
    }
    const { container } = render(<Parent />)
    await userEvent.click(theBox())
    expect(theBox().getAttribute('aria-checked')).toBe('true')
    expect(mark(container)).toBe('tick')
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onCheckedChange = vi.fn((next: boolean) => next)
    render(<Checkbox aria-label="Terms" checked={false} onCheckedChange={onCheckedChange} />)
    await userEvent.click(theBox())
    expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true])
    expect(theBox().getAttribute('aria-checked')).toBe('false')
  })

  it('follows its owner', async () => {
    function Owner() {
      const [on, setOn] = useState(false)
      return <><Checkbox aria-label="Terms" checked={on} onCheckedChange={setOn} /><output>{String(on)}</output></>
    }
    render(<Owner />)
    await userEvent.click(theBox())
    expect(theBox().getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('true')
  })
})

describe('disabled and readOnly do nothing', () => {
  it('disabled: no change and no call', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Terms" disabled onCheckedChange={onCheckedChange} />)
    await userEvent.click(theBox())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(theBox().getAttribute('aria-checked')).toBe('false')
    expect((theBox() as HTMLButtonElement).disabled).toBe(true)
  })

  it('readOnly: no change and no call, and it stays focusable', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Terms" readOnly defaultChecked onCheckedChange={onCheckedChange} />)
    await userEvent.click(theBox())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(theBox().getAttribute('aria-checked')).toBe('true')
    expect(document.activeElement).toBe(theBox())
  })
})

describe('what reaches the root', () => {
  it('className is merged last, so it wins a conflict with the target\'s own width', () => {
    render(<Checkbox aria-label="Terms" className="w-full" />)
    const classes = theBox().className.split(' ')
    expect(classes.at(-1)).toBe('w-full')
    expect(classes).not.toContain('w-fit')
  })

  it('ref is the button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Checkbox aria-label="Terms" ref={ref} />)
    expect(ref.current).toBe(theBox())
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('a caller\'s own inputRef holds the hidden input, an object ref and a function ref alike', () => {
    const object = { current: null as HTMLInputElement | null }
    let called: HTMLInputElement | null = null
    const { container } = render(
      <>
        <Checkbox aria-label="One" name="one" inputRef={object} />
        <Checkbox aria-label="Two" name="two" inputRef={(node) => { called = node }} />
      </>,
    )
    const [one, two] = [...container.querySelectorAll('input[type="checkbox"]')]
    expect(object.current).toBe(one)
    expect(called).toBe(two)
  })

  it('the hook still holds the input when the caller passes one: a reset finds the form through it', async () => {
    const object = { current: null as HTMLInputElement | null }
    render(<form id="f"><Checkbox aria-label="Terms" name="t" inputRef={object} /></form>)
    await userEvent.click(theBox())
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(theBox().getAttribute('aria-checked')).toBe('false')
  })
})
