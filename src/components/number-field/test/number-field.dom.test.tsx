import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '../index.js'
import type { NumberFieldChangeDetails } from '../types.js'

const field = () => screen.getByRole<HTMLInputElement>('textbox')
const hidden = (container: HTMLElement) => container.querySelector('input[type="number"]') as HTMLInputElement
const stepper = (name: string) => screen.getByRole<HTMLButtonElement>('button', { name })
const press = (name: string) => userEvent.click(stepper(name))
/** A handler whose calls read back as numbers and details. */
const handler = () => vi.fn((next: number | null, details: NumberFieldChangeDetails) => [next, details.reason])

describe('the steppers', () => {
  it('a click on each moves by step and calls onValueChange with Base UI\'s details', async () => {
    const onValueChange = handler()
    const { container } = render(<NumberField aria-label="Guests" name="g" defaultValue={2} onValueChange={onValueChange} />)
    await press('Increase')
    expect(field().value).toBe('3')
    await press('Decrease')
    await press('Decrease')
    expect(field().value).toBe('1')
    expect(hidden(container).value).toBe('1')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([3, 2, 1])
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'increment-press', isCanceled: false })
  })

  it('an empty field starts from 0, and a step of 0.5 adds a half', async () => {
    render(<NumberField aria-label="Hours" step={0.5} />)
    await press('Increase')
    expect(field().value).toBe('0')
    await press('Increase')
    expect(field().value).toBe('0.5')
  })

  it('stops at max: the increase stepper is disabled there', async () => {
    render(<NumberField aria-label="Guests" defaultValue={7} max={8} />)
    await press('Increase')
    expect(field().value).toBe('8')
    expect(stepper('Increase').disabled).toBe(true)
    expect(stepper('Decrease').disabled).toBe(false)
  })

  it('a handler that calls details.cancel() leaves the field as it was, on screen and in the hidden input', async () => {
    const { container } = render(<NumberField aria-label="A" name="a" defaultValue={2} onValueChange={(_next, details) => { details.cancel() }} />)
    await press('Increase')
    expect(field().value).toBe('2')
    expect(hidden(container).value).toBe('2')
  })
})

describe('typing', () => {
  it('250 typed with max={14} becomes 14 on blur', async () => {
    const { container } = render(<NumberField aria-label="A" name="a" max={14} />)
    await userEvent.type(field(), '250')
    act(() => { field().blur() })
    expect(field().value).toBe('14')
    expect(hidden(container).value).toBe('14')
  })

  it('a letter is refused, and Arabic-Indic digits are read as 12 in any locale', async () => {
    const { container } = render(<NumberField aria-label="A" name="a" />)
    await userEvent.type(field(), 'x')
    expect(field().value).toBe('')
    await userEvent.type(field(), '١٢')
    act(() => { field().blur() })
    expect(hidden(container).value).toBe('12')
  })

  it('under ar-u-nu-arab the number is shown in Arabic-Indic digits and the form gets the plain number', async () => {
    const { container } = render(<NumberField aria-label="A" name="a" locale="ar-u-nu-arab" defaultValue={5} />)
    expect(field().value).toBe('٥')
    await press('Increase')
    expect(field().value).toBe('٦')
    expect(hidden(container).value).toBe('6')
  })
})

describe('a pasted "1,234.5"', () => {
  const paste = (text: string) => {
    act(() => { field().focus() })
    fireEvent.paste(field(), { clipboardData: { getData: () => text } })
  }

  it('reads as 1234.5 under Latin digits, as Base UI reads it', () => {
    const { container } = render(<NumberField aria-label="A" name="a" step="any" />)
    paste('1,234.5')
    act(() => { field().blur() })
    expect(hidden(container).value).toBe('1234.5')
    expect(field().value).toBe('1,234.5')
  })

  it('reads as 1234.5 under Arabic-Indic digits too, where Base UI alone reads 1', () => {
    const { container } = render(<NumberField aria-label="A" name="a" locale="ar-u-nu-arab" step="any" />)
    paste('1,234.5')
    act(() => { field().blur() })
    expect(hidden(container).value).toBe('1234.5')
    expect(field().value).toBe('١٬٢٣٤٫٥')
  })

  it('is left alone in a read-only field', () => {
    const { container } = render(<NumberField aria-label="A" name="a" locale="ar-u-nu-arab" readOnly defaultValue={3} />)
    paste('1,234.5')
    expect(hidden(container).value).toBe('3')
  })
})

describe('a typed "1,234.5"', () => {
  it('reads as 1234.5 on blur under Arabic-Indic digits, on screen, in the form and for the caller, where Base UI alone reads 1', async () => {
    const onValueChange = handler()
    const { container } = render(<NumberField aria-label="A" name="a" locale="ar-u-nu-arab" step="any" onValueChange={onValueChange} />)
    await userEvent.type(field(), '1,234.5')
    act(() => { field().blur() })
    expect(hidden(container).value).toBe('1234.5')
    expect(field().value).toBe('١٬٢٣٤٫٥')
    expect(onValueChange.mock.lastCall?.[0]).toBe(1234.5)
  })

  it('reads as 1234 under Latin digits, as Base UI reads it', async () => {
    const { container } = render(<NumberField aria-label="A" name="a" />)
    await userEvent.type(field(), '1,234')
    act(() => { field().blur() })
    expect(hidden(container).value).toBe('1234')
    expect(field().value).toBe('1,234')
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = handler()
    render(<NumberField aria-label="A" value={4} onValueChange={onValueChange} />)
    await press('Increase')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([5])
    expect(field().value).toBe('4')
  })

  it('follows its owner, clamped to max', async () => {
    function Owner() {
      const [count, setCount] = useState<number | null>(30)
      return <><NumberField aria-label="A" max={10} value={count} onValueChange={setCount} /><output>{String(count)}</output></>
    }
    render(<Owner />)
    expect(field().value).toBe('10')
    await press('Decrease')
    expect(field().value).toBe('9')
    expect(screen.getByRole('status').textContent).toBe('9')
  })
})

describe('disabled and readOnly do nothing', () => {
  it('disabled: no step and no call; both steppers are disabled', async () => {
    const onValueChange = vi.fn()
    render(<NumberField aria-label="A" disabled defaultValue={2} onValueChange={onValueChange} />)
    for (const name of ['Increase', 'Decrease']) expect(stepper(name).disabled).toBe(true)
    await userEvent.type(field(), '{ArrowUp}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('readOnly: no step and no call, and the input stays focusable', async () => {
    const onValueChange = vi.fn()
    render(<NumberField aria-label="A" readOnly defaultValue={2} onValueChange={onValueChange} />)
    await press('Increase')
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(field().value).toBe('2')
    expect(document.activeElement).toBe(field())
  })
})

describe('what reaches where', () => {
  it('className is merged last on the root, so it wins a conflict with the width of an Input', () => {
    const { container } = render(<NumberField aria-label="A" className="w-full" />)
    const classes = (container.firstElementChild as HTMLElement).className.split(' ')
    expect(classes.at(-1)).toBe('w-full')
    expect(classes).not.toContain('w-fit')
  })

  it('ref is the root div, and a caller\'s inputRef holds the hidden input', () => {
    const ref = { current: null as HTMLDivElement | null }
    const inputRef = { current: null as HTMLInputElement | null }
    const { container } = render(<NumberField aria-label="A" name="a" ref={ref} inputRef={inputRef} />)
    expect(ref.current).toBe(container.firstElementChild)
    expect(inputRef.current).toBe(hidden(container))
  })

  it('the provider\'s locale is used when the field has none: an Arabic provider names the steppers in Arabic', () => {
    render(<TopClassProvider direction="rtl" locale="ar"><NumberField aria-label="A" /></TopClassProvider>)
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['إنقاص', 'زيادة'])
  })
})
