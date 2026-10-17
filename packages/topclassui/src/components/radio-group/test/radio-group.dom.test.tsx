import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import { useChromiumLabels } from './chromium-labels.js'

useChromiumLabels()

const radio = (name: string) => screen.getByRole('radio', { name })
const states = () => screen.getAllByRole('radio').map((one) => one.getAttribute('aria-checked'))
const checkedInputs = (container: HTMLElement) => [...container.querySelectorAll('input[type="radio"]')].map((input) => (input as HTMLInputElement).checked)

function Plan(props: Partial<Parameters<typeof RadioGroupRoot>[0]>) {
  return (
    <RadioGroupRoot aria-label="Plan" name="plan" {...props}>
      <RadioGroupItem value="free">Free</RadioGroupItem>
      <RadioGroupItem value="pro">Pro</RadioGroupItem>
      <RadioGroupItem value="team">Team</RadioGroupItem>
    </RadioGroupRoot>
  )
}

describe('a press selects once, with Base UI\'s details', () => {
  it('a click calls onValueChange once, with the value and details whose reason is none', async () => {
    const onValueChange = vi.fn()
    render(<Plan onValueChange={onValueChange} />)
    await userEvent.click(radio('Pro'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('pro')
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'none', isCanceled: false })
    expect(states()).toEqual(['false', 'true', 'false'])
  })

  it('a click on the text selects its radio once', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(<Plan onValueChange={onValueChange} />)
    await userEvent.click(screen.getByText('Team'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['team'])
    expect(states()).toEqual(['false', 'false', 'true'])
  })

  it('uncontrolled: it starts at defaultValue, the radio inputs follow each press, and the dot moves', async () => {
    const { container } = render(<Plan defaultValue="free" />)
    expect(checkedInputs(container)).toEqual([true, false, false])
    await userEvent.click(radio('Team'))
    expect(states()).toEqual(['false', 'false', 'true'])
    expect(checkedInputs(container)).toEqual([false, false, true])
    expect(container.querySelectorAll('svg')).toHaveLength(1)
    expect(radio('Team').querySelector('svg')).not.toBeNull()
  })

  it('a click on the checked radio calls nothing', async () => {
    const onValueChange = vi.fn()
    render(<Plan defaultValue="pro" onValueChange={onValueChange} />)
    await userEvent.click(radio('Pro'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('a handler that calls details.cancel() leaves the group as it was, on screen and in the inputs', async () => {
    const { container } = render(<Plan defaultValue="free" onValueChange={(_next, details) => { details.cancel() }} />)
    await userEvent.click(radio('Pro'))
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(checkedInputs(container)).toEqual([true, false, false])
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(<Plan value="free" onValueChange={onValueChange} />)
    await userEvent.click(radio('Pro'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['pro'])
    expect(states()).toEqual(['true', 'false', 'false'])
  })

  it('follows its owner', async () => {
    function Owner() {
      const [value, setValue] = useState('free')
      return <><Plan value={value} onValueChange={setValue} /><output>{value}</output></>
    }
    render(<Owner />)
    await userEvent.click(radio('Team'))
    expect(states()).toEqual(['false', 'false', 'true'])
    expect(screen.getByRole('status').textContent).toBe('team')
  })
})

describe('disabled and readOnly do nothing', () => {
  it('a disabled group: no change and no call, and every radio is a disabled button', async () => {
    const onValueChange = vi.fn()
    render(<Plan disabled defaultValue="free" onValueChange={onValueChange} />)
    await userEvent.click(radio('Pro'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(screen.getAllByRole('radio').map((one) => (one as HTMLButtonElement).disabled)).toEqual([true, true, true])
  })

  it('a disabled item: no change and no call; the others still select', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(
      <RadioGroupRoot aria-label="Plan" onValueChange={onValueChange}>
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="b" disabled>B</RadioGroupItem>
      </RadioGroupRoot>,
    )
    await userEvent.click(radio('B'))
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.click(radio('A'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['a'])
  })

  it('readOnly: no change and no call, and the radio stays focusable', async () => {
    const onValueChange = vi.fn()
    render(<Plan readOnly defaultValue="free" onValueChange={onValueChange} />)
    await userEvent.click(radio('Pro'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(document.activeElement).toBe(radio('Pro'))
  })
})

describe('what reaches each element', () => {
  it('the group: className merged last, so it wins a conflict with its own layout', () => {
    render(<Plan className="flex-row" />)
    const classes = screen.getByRole('radiogroup').className.split(' ')
    expect(classes.at(-1)).toBe('flex-row')
    expect(classes).not.toContain('flex-col')
  })

  it('the item: className merged last on the label, so it wins a conflict with its own gap', () => {
    render(<RadioGroupRoot aria-label="P"><RadioGroupItem value="a" className="gap-4">A</RadioGroupItem></RadioGroupRoot>)
    const classes = (radio('A').closest('label') as HTMLLabelElement).className.split(' ')
    expect(classes.at(-1)).toBe('gap-4')
    expect(classes).not.toContain('gap-2')
  })

  it('ref on the group is the radiogroup, and on an item the radio button', () => {
    const group = { current: null as HTMLDivElement | null }
    const item = { current: null as HTMLButtonElement | null }
    render(<RadioGroupRoot aria-label="P" ref={group}><RadioGroupItem value="a" ref={item}>A</RadioGroupItem></RadioGroupRoot>)
    expect(group.current).toBe(screen.getByRole('radiogroup'))
    expect(item.current).toBe(radio('A'))
    expect(item.current?.tagName).toBe('BUTTON')
  })

  it('a function ref on the group is called with the radiogroup', () => {
    let called: HTMLDivElement | null = null
    render(<RadioGroupRoot aria-label="P" ref={(node) => { called = node }}><RadioGroupItem value="a">A</RadioGroupItem></RadioGroupRoot>)
    expect(called).toBe(screen.getByRole('radiogroup'))
  })

  it('the hook still holds the group when the caller passes a ref: a reset finds the form through it', async () => {
    const group = { current: null as HTMLDivElement | null }
    render(<form id="f"><Plan ref={group} /></form>)
    await userEvent.click(radio('Pro'))
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(states()).toEqual(['false', 'false', 'false'])
  })

  it('a caller\'s inputRef on the group is Base UI\'s: it holds the checked radio input', () => {
    const input = { current: null as HTMLInputElement | null }
    const { container } = render(<Plan defaultValue="pro" inputRef={input} />)
    expect(input.current).toBe(container.querySelectorAll('input')[1])
  })
})
