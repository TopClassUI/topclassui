import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

const segment = (name: string) => screen.getByRole('radio', { name })
const states = () => screen.getAllByRole('radio').map((one) => one.getAttribute('aria-checked'))
const checkedInputs = (container: HTMLElement) => [...container.querySelectorAll('input[type="radio"]')].map((input) => (input as HTMLInputElement).checked)

type Props = Partial<Parameters<typeof SegmentedControlRoot>[0]>

function View(props: Props) {
  return (
    <SegmentedControlRoot aria-label="View" name="view" defaultValue="board" {...props}>
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="table">Table</SegmentedControlItem>
      <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}

describe('a press selects once, with Base UI\'s details', () => {
  it('a click calls onValueChange once, with the value and details whose reason is none', async () => {
    const onValueChange = vi.fn()
    render(<View onValueChange={onValueChange} />)
    await userEvent.click(segment('Table'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('table')
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'none', isCanceled: false })
    expect(states()).toEqual(['false', 'true', 'false'])
  })

  it('a click on the text of a segment selects it once', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(<View onValueChange={onValueChange} />)
    await userEvent.click(screen.getByText('Calendar'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['calendar'])
    expect(states()).toEqual(['false', 'false', 'true'])
  })

  it('uncontrolled: it starts at defaultValue, and the radio inputs follow each press', async () => {
    const { container } = render(<View />)
    expect(checkedInputs(container)).toEqual([true, false, false])
    await userEvent.click(segment('Calendar'))
    expect(states()).toEqual(['false', 'false', 'true'])
    expect(checkedInputs(container)).toEqual([false, false, true])
  })

  it('a click on the selected segment calls nothing: it is never emptied, and the handler never hears nothing', async () => {
    const onValueChange = vi.fn()
    render(<View onValueChange={onValueChange} />)
    await userEvent.click(segment('Board'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states()).toEqual(['true', 'false', 'false'])
  })

  it('a handler that calls details.cancel() leaves the track as it was, on screen and in the inputs', async () => {
    const { container } = render(<View onValueChange={(_next, details) => { details.cancel() }} />)
    await userEvent.click(segment('Table'))
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(checkedInputs(container)).toEqual([true, false, false])
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(<View value="board" onValueChange={onValueChange} />)
    await userEvent.click(segment('Table'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['table'])
    expect(states()).toEqual(['true', 'false', 'false'])
  })

  it('follows its owner, as the README sample writes it', async () => {
    function Owner() {
      const [view, setView] = useState('board')
      return <><View value={view} onValueChange={setView} /><output>{view}</output></>
    }
    render(<Owner />)
    await userEvent.click(segment('Calendar'))
    expect(states()).toEqual(['false', 'false', 'true'])
    expect(screen.getByRole('status').textContent).toBe('calendar')
  })
})

describe('disabled and readOnly do nothing', () => {
  it('a disabled track: no change and no call, and every segment is a disabled button', async () => {
    const onValueChange = vi.fn()
    render(<View disabled onValueChange={onValueChange} />)
    await userEvent.click(segment('Table'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(screen.getAllByRole('radio').map((one) => (one as HTMLButtonElement).disabled)).toEqual([true, true, true])
  })

  it('a disabled segment: no change and no call; the others still select', async () => {
    const onValueChange = vi.fn((next: string) => next)
    render(
      <SegmentedControlRoot aria-label="View" defaultValue="c" onValueChange={onValueChange}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>B</SegmentedControlItem>
        <SegmentedControlItem value="c">C</SegmentedControlItem>
      </SegmentedControlRoot>,
    )
    await userEvent.click(segment('B'))
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.click(segment('A'))
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['a'])
  })

  it('readOnly: no change and no call, and the segment stays focusable', async () => {
    const onValueChange = vi.fn()
    render(<View readOnly onValueChange={onValueChange} />)
    await userEvent.click(segment('Table'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states()).toEqual(['true', 'false', 'false'])
    expect(document.activeElement).toBe(segment('Table'))
  })
})

describe('what reaches each element', () => {
  it('the track: className merged last, so it wins a conflict with its own gap; the holder keeps its own', () => {
    render(<View className="gap-4" />)
    const track = screen.getByRole('radiogroup')
    expect(track.className.split(' ').at(-1)).toBe('gap-4')
    expect(track.className.split(' ')).not.toContain('gap-0.5')
    expect(track.parentElement?.className).toBe('grid grid-cols-1')
  })

  it('a segment: className merged last, so it wins a conflict with its own padding', () => {
    render(<SegmentedControlRoot aria-label="V" defaultValue="a"><SegmentedControlItem value="a" className="px-8">A</SegmentedControlItem></SegmentedControlRoot>)
    const classes = segment('A').className.split(' ')
    expect(classes.at(-1)).toBe('px-8')
    expect(classes).not.toContain('px-3')
  })

  it('ref on the root is the radiogroup, never the holder, and on a segment its button', () => {
    const track = { current: null as HTMLDivElement | null }
    const item = { current: null as HTMLButtonElement | null }
    render(<SegmentedControlRoot aria-label="V" defaultValue="a" ref={track}><SegmentedControlItem value="a" ref={item}>A</SegmentedControlItem></SegmentedControlRoot>)
    expect(track.current).toBe(screen.getByRole('radiogroup'))
    expect(item.current).toBe(segment('A'))
    expect(item.current?.tagName).toBe('BUTTON')
  })

  it('a function ref on the root is called with the radiogroup', () => {
    let called: HTMLDivElement | null = null
    render(<SegmentedControlRoot aria-label="V" defaultValue="a" ref={(node) => { called = node }}><SegmentedControlItem value="a">A</SegmentedControlItem></SegmentedControlRoot>)
    expect(called).toBe(screen.getByRole('radiogroup'))
  })

  it('the hook still holds the track when the caller passes a ref: a reset finds the form through it', async () => {
    const track = { current: null as HTMLDivElement | null }
    render(<form id="f"><View ref={track} /></form>)
    await userEvent.click(segment('Table'))
    act(() => { (document.getElementById('f') as HTMLFormElement).reset() })
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    expect(states()).toEqual(['true', 'false', 'false'])
  })

  it('a caller\'s inputRef on the root is Base UI\'s: it holds the checked radio input', () => {
    const input = { current: null as HTMLInputElement | null }
    const { container } = render(<View defaultValue="table" inputRef={input} />)
    expect(input.current).toBe(container.querySelectorAll('input')[1])
  })
})

// R-5.2-7: the label sits on an element of its own, or text-overflow has nothing to apply to.
describe('the label of a segment', () => {
  const one = (children: ReactNode, icon?: ReactNode) => {
    render(<SegmentedControlRoot aria-label="V" defaultValue="a"><SegmentedControlItem value="a" icon={icon} data-testid="s">{children}</SegmentedControlItem></SegmentedControlRoot>)
    return screen.getByTestId('s')
  }

  it('is one span that truncates, around the whole text, and names the segment', () => {
    const element = one('Calendar')
    expect([...element.children].map((child) => child.outerHTML)).toEqual(['<span dir="auto" class="truncate min-w-0">Calendar</span>'])
    expect(segment('Calendar')).toBe(element)
  })

  it('cuts a label of 300 characters at 100: the string is bounded, not only its box', () => {
    expect(one('W'.repeat(300)).textContent).toBe('WWWWWWWWWW'.repeat(10))
  })

  it('an icon comes first, in a span of its own, and leaves the name to the text', () => {
    const element = one('Light', <svg aria-hidden="true" />)
    expect([...element.children].map((child) => child.className)).toEqual(['flex shrink-0', 'truncate min-w-0'])
    expect(segment('Light')).toBe(element)
  })
})
