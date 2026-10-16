import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OTPField, type OtpFieldProps } from '../index.js'

const cells = () => [...document.querySelectorAll('[role="group"] input')] as HTMLInputElement[]
const shown = () => cells().map((cell) => cell.value).join('')
const hiddenInput = () => document.querySelector('[role="group"] + input') as HTMLInputElement
const focusedCell = () => cells().indexOf(document.activeElement as HTMLInputElement)
/** The first cell, by its role and the label's name: once hydrated, Base UI names the group by the same label. */
const first = () => screen.getByRole('textbox', { name: 'Code' })

function Code(props: Partial<OtpFieldProps>) {
  return <><label htmlFor="code">Code</label><OTPField id="code" name="code" {...props as OtpFieldProps} /></>
}

describe('typing', () => {
  it('a digit fills a cell and moves on; the hidden input holds the code so far', async () => {
    render(<Code />)
    await userEvent.click(first())
    await userEvent.keyboard('482')
    expect(shown()).toBe('482')
    expect(focusedCell()).toBe(3)
    expect(hiddenInput().value).toBe('482')
  })

  it('an Arabic-Indic or Persian digit is stored as ASCII, and a letter is refused and reported', async () => {
    const onValueInvalid = vi.fn((value: string) => value)
    render(<Code onValueInvalid={onValueInvalid} />)
    await userEvent.click(first())
    await userEvent.keyboard('٤۸a2')
    expect(shown()).toBe('482')
    expect(hiddenInput().value).toBe('482')
    expect(onValueInvalid.mock.calls.map((call) => call[0])).toEqual(['a'])
  })

  it('onValueChange hears each value with Base UI\'s details, and onValueComplete fires at the last cell', async () => {
    const onValueChange = vi.fn((value: string, details: unknown) => [value, details])
    const onValueComplete = vi.fn((value: string) => value)
    render(<Code length={3} onValueChange={onValueChange} onValueComplete={onValueComplete} />)
    await userEvent.click(first())
    await userEvent.keyboard('12')
    expect(onValueComplete).not.toHaveBeenCalled()
    await userEvent.keyboard('3')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['1', '12', '123'])
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'input-change', isCanceled: false })
    expect(onValueComplete.mock.calls.map((call) => call[0])).toEqual(['123'])
    expect(focusedCell()).toBe(2)
  })

  it('a handler that calls details.cancel() leaves the code as it was, on screen and in the form', async () => {
    render(<Code defaultValue="4" onValueChange={(_next, details) => { details.cancel() }} />)
    await userEvent.click(screen.getByRole('textbox', { name: 'Character 2 of 6' }))
    await userEvent.keyboard('8')
    expect(shown()).toBe('4')
    expect(hiddenInput().value).toBe('4')
  })
})

describe('paste', () => {
  it('a whole code fills every cell and the focus lands on the last', async () => {
    render(<Code />)
    await userEvent.click(first())
    await userEvent.paste('482913')
    expect(shown()).toBe('482913')
    expect(hiddenInput().value).toBe('482913')
    expect(focusedCell()).toBe(5)
  })

  it('a code with spaces and Arabic-Indic digits is stored as six ASCII digits', async () => {
    render(<Code />)
    await userEvent.click(first())
    await userEvent.paste(' ٤٨٢ ٩١٣ ')
    expect(hiddenInput().value).toBe('482913')
  })

  it('a paste longer than the field is cut at its length', async () => {
    render(<Code length={4} />)
    await userEvent.click(first())
    await userEvent.paste('12345678')
    expect(shown()).toBe('1234')
  })
})

describe('a caller\'s own rules pass through', () => {
  it('alphanumeric takes letters, and Base UI keeps its ASCII filter', async () => {
    render(<Code validationType="alphanumeric" length={4} />)
    await userEvent.click(first())
    await userEvent.keyboard('a1٢B')
    expect(shown()).toBe('a1B')
  })

  it('a normalizeValue of the caller replaces ours', async () => {
    render(<Code length={3} normalizeValue={(value) => value.replace(/[^0-9]/g, '')} />)
    await userEvent.click(first())
    await userEvent.keyboard('٤1')
    expect(shown()).toBe('1')
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = vi.fn((value: string) => value)
    render(<Code value="12" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('textbox', { name: 'Character 3 of 6' }))
    await userEvent.keyboard('3')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['123'])
    expect(shown()).toBe('12')
  })

  it('follows its owner', async () => {
    function Owner() {
      const [value, setValue] = useState('')
      return <><Code value={value} onValueChange={setValue} /><output>{value}</output></>
    }
    render(<Owner />)
    await userEvent.click(first())
    await userEvent.keyboard('77')
    expect(screen.getByRole('status').textContent).toBe('77')
    expect(shown()).toBe('77')
  })
})

describe('disabled and readOnly', () => {
  it('disabled: every cell is a disabled input, and nothing can be typed', async () => {
    const onValueChange = vi.fn()
    render(<Code disabled defaultValue="12" onValueChange={onValueChange} />)
    expect(cells().map((cell) => cell.disabled)).toEqual([true, true, true, true, true, true])
    await userEvent.type(cells()[2] as HTMLInputElement, '3')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('readOnly: a cell takes the focus and the arrows, and the code does not change', async () => {
    const onValueChange = vi.fn()
    render(<Code readOnly defaultValue="12" onValueChange={onValueChange} />)
    await userEvent.click(first())
    await userEvent.keyboard('9{Backspace}{ArrowRight}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(shown()).toBe('12')
    expect(focusedCell()).toBe(1)
  })
})

describe('what reaches each element', () => {
  it('ref is the group, and the hook still holds it: a reset finds the form through it', async () => {
    const group = { current: null as HTMLDivElement | null }
    render(<form id="f"><Code ref={group} /></form>)
    expect(group.current).toBe(screen.getByRole('group'))
    await userEvent.click(first())
    await userEvent.keyboard('5')
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(shown()).toBe('')
  })

  it('a function ref is called with the group', () => {
    let called: HTMLDivElement | null = null
    render(<OTPField aria-labelledby="x" ref={(node) => { called = node }} />)
    expect(called).toBe(screen.getByRole('group'))
  })

  it('className is merged last, so it wins a conflict with the gap of the row', () => {
    render(<Code className="gap-4" />)
    const classes = screen.getByRole('group').className.split(' ')
    expect(classes.at(-1)).toBe('gap-4')
    expect(classes).not.toContain('gap-2')
  })

  it('a native label names the first cell, and once hydrated the group too; the later cells are named by their place', () => {
    render(<Code length={3} />)
    expect(first()).toBe(cells()[0])
    expect(screen.getByRole('group', { name: 'Code' })).toBe(document.querySelector('[role="group"]'))
    expect(screen.getByRole('textbox', { name: 'Character 3 of 3' })).toBe(cells()[2])
  })

  it('aria-labelledby names the first cell and the group, so the tab stop on a later cell sits in a named group', () => {
    render(<><span id="named">Code</span><OTPField aria-labelledby="named" length={4} defaultValue="12" /></>)
    expect(first()).toBe(cells()[0])
    expect(screen.getByRole('group', { name: 'Code' })).toBe(document.querySelector('[role="group"]'))
    const stop = cells().find((cell) => cell.tabIndex === 0)
    expect(stop).toBe(screen.getByRole('textbox', { name: 'Character 3 of 4' }))
    expect(stop?.closest('[role="group"]')).toBe(screen.getByRole('group', { name: 'Code' }))
  })
})
