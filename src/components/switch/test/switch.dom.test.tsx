import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from '../index.js'

const theSwitch = () => screen.getByRole('switch')
const hidden = (container: HTMLElement) => container.querySelector('input[type="checkbox"]') as HTMLInputElement

describe('a press toggles it once, with Base UI\'s details', () => {
  it('a click calls onCheckedChange once, with true and details whose reason is none', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Digest" onCheckedChange={onCheckedChange} />)
    await userEvent.click(theSwitch())
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
    expect(onCheckedChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'none', isCanceled: false })
    expect(theSwitch().getAttribute('aria-checked')).toBe('true')
  })

  it('uncontrolled: it starts at defaultChecked and the hidden checkbox follows each press', async () => {
    const { container } = render(<Switch aria-label="Digest" defaultChecked />)
    expect(theSwitch().getAttribute('aria-checked')).toBe('true')
    expect(hidden(container).checked).toBe(true)
    await userEvent.click(theSwitch())
    expect(theSwitch().getAttribute('aria-checked')).toBe('false')
    expect(hidden(container).checked).toBe(false)
    expect(theSwitch().hasAttribute('data-unchecked')).toBe(true)
  })

  it('a handler that calls details.cancel() leaves the switch as it was, on screen and in the input', async () => {
    const { container } = render(<Switch aria-label="Digest" onCheckedChange={(_next, details) => { details.cancel() }} />)
    await userEvent.click(theSwitch())
    expect(theSwitch().getAttribute('aria-checked')).toBe('false')
    expect(hidden(container).checked).toBe(false)
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onCheckedChange = vi.fn((next: boolean) => next)
    render(<Switch aria-label="Digest" checked={false} onCheckedChange={onCheckedChange} />)
    await userEvent.click(theSwitch())
    expect(onCheckedChange.mock.calls.map((call) => call[0])).toEqual([true])
    expect(theSwitch().getAttribute('aria-checked')).toBe('false')
  })

  it('follows its owner', async () => {
    function Owner() {
      const [on, setOn] = useState(false)
      return <><Switch aria-label="Digest" checked={on} onCheckedChange={setOn} /><output>{String(on)}</output></>
    }
    render(<Owner />)
    await userEvent.click(theSwitch())
    expect(theSwitch().getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('true')
  })
})

describe('disabled and readOnly do nothing', () => {
  it('disabled: no change and no call', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Digest" disabled onCheckedChange={onCheckedChange} />)
    await userEvent.click(theSwitch())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(theSwitch().getAttribute('aria-checked')).toBe('false')
    expect((theSwitch() as HTMLButtonElement).disabled).toBe(true)
  })

  it('readOnly: no change and no call, and it stays focusable', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch aria-label="Digest" readOnly defaultChecked onCheckedChange={onCheckedChange} />)
    await userEvent.click(theSwitch())
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(theSwitch().getAttribute('aria-checked')).toBe('true')
    expect(document.activeElement).toBe(theSwitch())
  })
})

describe('what reaches the root', () => {
  it('className is merged last, so it wins a conflict with the target\'s own width', () => {
    render(<Switch aria-label="Digest" className="w-full" />)
    const classes = theSwitch().className.split(' ')
    expect(classes.at(-1)).toBe('w-full')
    expect(classes).not.toContain('w-fit')
  })

  it('ref is the button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Switch aria-label="Digest" ref={ref} />)
    expect(ref.current).toBe(theSwitch())
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('a caller\'s own inputRef holds the hidden input, an object ref and a function ref alike', () => {
    const object = { current: null as HTMLInputElement | null }
    let called: HTMLInputElement | null = null
    const { container } = render(
      <>
        <Switch aria-label="One" name="one" inputRef={object} />
        <Switch aria-label="Two" name="two" inputRef={(node) => { called = node }} />
      </>,
    )
    const [one, two] = [...container.querySelectorAll('input[type="checkbox"]')]
    expect(object.current).toBe(one)
    expect(called).toBe(two)
  })

  it('the hook still holds the input when the caller passes one: a reset finds the form through it', async () => {
    const object = { current: null as HTMLInputElement | null }
    render(<form id="f"><Switch aria-label="Digest" name="d" inputRef={object} /></form>)
    await userEvent.click(theSwitch())
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(theSwitch().getAttribute('aria-checked')).toBe('false')
  })
})
