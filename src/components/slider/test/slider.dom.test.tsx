import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Slider } from '../index.js'

const thumb = (name: string) => screen.getByRole('slider', { name })
const now = (name = 'Volume') => thumb(name).getAttribute('aria-valuenow')
const press = async (key: string, name = 'Volume') => { thumb(name).focus(); await userEvent.keyboard(key) }

describe('a change reaches the caller with Base UI\'s details', () => {
  it('one thumb: a number, the reason, and thumb 0; onValueCommitted follows', async () => {
    const onValueChange = vi.fn()
    const onValueCommitted = vi.fn((value: number) => value)
    render(<Slider aria-label="Volume" defaultValue={50} onValueChange={onValueChange} onValueCommitted={onValueCommitted} />)
    await press('{ArrowUp}')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe(51)
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'keyboard', activeThumbIndex: 0, isCanceled: false })
    expect(onValueCommitted.mock.calls.map((call) => call[0])).toEqual([51])
  })

  it('a range: the pair, and the index of the thumb that moved', async () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Price" defaultValue={[20, 80]} onValueChange={onValueChange} />)
    await press('{ArrowDown}', 'Maximum')
    expect(onValueChange.mock.calls[0]?.[0]).toEqual([20, 79])
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ activeThumbIndex: 1 })
  })

  it('a handler that calls details.cancel() leaves the thumb where it was, on screen and in the input', async () => {
    const { container } = render(<Slider aria-label="Volume" name="volume" defaultValue={50} onValueChange={(_value, details) => { details.cancel() }} />)
    await press('{ArrowUp}{End}')
    expect(now()).toBe('50')
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('50')
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = vi.fn((value: number) => value)
    render(<Slider aria-label="Volume" value={30} onValueChange={onValueChange} />)
    await press('{ArrowUp}')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([31])
    expect(now()).toBe('30')
  })

  it('follows its owner, through a setter handed straight to onValueChange', async () => {
    function Owner() {
      const [value, setValue] = useState(30)
      return <><Slider aria-label="Volume" value={value} onValueChange={setValue} /><output>{value}</output></>
    }
    render(<Owner />)
    await press('{PageUp}')
    expect(now()).toBe('40')
    expect(screen.getByRole('status').textContent).toBe('40')
  })

  it('a range follows its owner the same way', async () => {
    function Owner() {
      const [value, setValue] = useState<readonly [number, number]>([10, 90])
      return <><Slider aria-label="Price" value={value} onValueChange={setValue} /><output>{value.join('-')}</output></>
    }
    render(<Owner />)
    await press('{PageUp}', 'Minimum')
    expect(screen.getByRole('status').textContent).toBe('20-90')
  })
})

describe('disabled', () => {
  it('no change and no call, and every range input is disabled', async () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Price" disabled defaultValue={[20, 80]} onValueChange={onValueChange} />)
    await press('{ArrowUp}', 'Minimum')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('slider').map((input) => (input as HTMLInputElement).disabled)).toEqual([true, true])
  })
})

describe('invalid reaches the range input a screen reader lands on', () => {
  const marks = () => screen.getAllByRole('slider').map((input) => input.getAttribute('aria-invalid'))

  it('one thumb and both thumbs of a range, from invalid', () => {
    render(<><Slider aria-label="Volume" invalid defaultValue={50} /><Slider aria-label="Price" invalid defaultValue={[20, 80]} /></>)
    expect(marks()).toEqual(['true', 'true', 'true'])
  })

  it('from the aria-invalid a Field passes, true or "true"; "false" and none leave it off', () => {
    render(<>
      <Slider aria-label="A" aria-invalid defaultValue={50} />
      <Slider aria-label="B" aria-invalid="true" defaultValue={50} />
      <Slider aria-label="C" aria-invalid="false" defaultValue={50} />
      <Slider aria-label="D" defaultValue={50} />
    </>)
    expect(marks()).toEqual(['true', 'true', null, null])
  })

  it('follows the prop when it turns off and on, and survives a key', async () => {
    const { rerender } = render(<Slider aria-label="Volume" invalid defaultValue={50} />)
    rerender(<Slider aria-label="Volume" invalid={false} defaultValue={50} />)
    expect(marks()).toEqual([null])
    rerender(<Slider aria-label="Volume" invalid defaultValue={50} />)
    await press('{ArrowUp}')
    expect([now(), ...marks()]).toEqual(['51', 'true'])
  })
})

describe('what reaches each element', () => {
  it('className merged last on the group, so it wins a conflict with its own width', () => {
    render(<Slider aria-label="Volume" className="w-40" />)
    const classes = screen.getByRole('group').className.split(' ')
    expect(classes.at(-1)).toBe('w-40')
    expect(classes).not.toContain('w-fit')
  })

  it('ref is the group, an object or a function', () => {
    const group = { current: null as HTMLDivElement | null }
    let called: HTMLDivElement | null = null
    render(<><Slider aria-label="A" ref={group} /><Slider aria-label="B" ref={(node) => { called = node }} /></>)
    const [a, b] = screen.getAllByRole('group')
    expect(group.current).toBe(a)
    expect(called).toBe(b)
  })

  it('the hook still holds the group when the caller passes a ref: a reset finds the form through it', async () => {
    const group = { current: null as HTMLDivElement | null }
    render(<form id="f"><Slider aria-label="Volume" ref={group} defaultValue={50} /></form>)
    await press('{End}')
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(now()).toBe('50')
  })

  it('showValue: the output follows the value', async () => {
    render(<Slider aria-label="Volume" defaultValue={50} showValue />)
    await press('{PageDown}')
    expect(screen.getByRole('status').textContent).toBe('40')
  })
})
