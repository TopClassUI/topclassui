import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Rating } from '../index.js'

/** How much of each star is drawn, first to last, from the width class of its clip. */
const fills = (root: Element) => [...root.querySelectorAll('label > span')].map((star) => {
  const fill = star.querySelector(':scope > span')
  return fill === null ? 0 : fill.classList.contains('w-full') ? 1 : 0.5
})

const radios = () => screen.getAllByRole<HTMLInputElement>('radio')
const checkedStep = () => radios().findIndex((radio) => radio.checked) + 1

describe('the editing half is a native radio group', () => {
  it('renders a radiogroup named by the caller, one radio per step, each named by its count', () => {
    render(<Rating readOnly={false} aria-label="Stay" />)
    expect(screen.getByRole('radiogroup', { name: 'Stay' }).tagName).toBe('SPAN')
    expect(radios().map((radio) => radio.getAttribute('aria-label'))).toEqual(['1 star', '2 stars', '3 stars', '4 stars', '5 stars'])
    expect(radios().map((radio) => radio.value)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('puts every radio in one group: the caller\'s name, or an id of its own', () => {
    const { unmount } = render(<Rating readOnly={false} aria-label="Stay" name="stay" />)
    expect(new Set(radios().map((radio) => radio.name))).toEqual(new Set(['stay']))
    unmount()
    render(<Rating readOnly={false} aria-label="Stay" />)
    const names = new Set(radios().map((radio) => radio.name))
    expect(names.size).toBe(1)
    expect([...names][0]).toMatch(/^_[rR]_\w+_$/)
  })

  it('checks defaultValue, rounded to a whole step, and fills up to it', () => {
    render(<Rating readOnly={false} aria-label="Stay" defaultValue={2.6} />)
    expect(checkedStep()).toBe(3)
    expect(fills(screen.getByRole('radiogroup'))).toEqual([1, 1, 1, 0, 0])
  })

  it('checks none at 0', () => {
    render(<Rating readOnly={false} aria-label="Stay" />)
    expect(checkedStep()).toBe(0)
  })

  it('a click checks the step and calls onValueChange once with it; the checked step again calls nothing', async () => {
    const onValueChange = vi.fn()
    render(<Rating readOnly={false} aria-label="Stay" onValueChange={onValueChange} />)
    await userEvent.click(radios()[3] as HTMLInputElement)
    expect(onValueChange.mock.calls).toEqual([[4]])
    await userEvent.click(radios()[3] as HTMLInputElement)
    expect(onValueChange.mock.calls).toEqual([[4]])
    expect(checkedStep()).toBe(4)
    expect(fills(screen.getByRole('radiogroup'))).toEqual([1, 1, 1, 1, 0])
  })

  it('controlled: shows the value it is given, and follows the parent', async () => {
    function Parent() {
      const [value, setValue] = useState(1)
      return (
        <>
          <Rating readOnly={false} aria-label="Stay" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => { setValue(5) }}>All</button>
        </>
      )
    }
    render(<Parent />)
    expect(checkedStep()).toBe(1)
    await userEvent.click(radios()[2] as HTMLInputElement)
    expect(checkedStep()).toBe(3)
    await userEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(checkedStep()).toBe(5)
  })

  it('controlled with no handler stays where the parent put it', async () => {
    render(<Rating readOnly={false} aria-label="Stay" value={2} />)
    await userEvent.click(radios()[4] as HTMLInputElement)
    expect(checkedStep()).toBe(2)
  })
})

describe('the pointer fills up to the star it is on', () => {
  it('fills to the hovered step, and leaving the row puts the value back', () => {
    render(<Rating readOnly={false} aria-label="Stay" defaultValue={2} />)
    const group = screen.getByRole('radiogroup')
    const labels = group.querySelectorAll('label')
    fireEvent.pointerEnter(labels[4] as HTMLLabelElement)
    expect(fills(group)).toEqual([1, 1, 1, 1, 1])
    fireEvent.pointerEnter(labels[0] as HTMLLabelElement)
    expect(fills(group)).toEqual([1, 0, 0, 0, 0])
    fireEvent.pointerLeave(group)
    expect(fills(group)).toEqual([1, 1, 0, 0, 0])
  })

  it('a change while the pointer rests on a star shows the checked step, not the hovered one', () => {
    render(<Rating readOnly={false} aria-label="Stay" />)
    const group = screen.getByRole('radiogroup')
    fireEvent.pointerEnter(group.querySelectorAll('label')[1] as HTMLLabelElement)
    fireEvent.click(radios()[1] as HTMLInputElement)
    expect(fills(group)).toEqual([1, 1, 0, 0, 0])
    // An arrow key checks another radio with no pointer event: the pointer is still on star 2.
    fireEvent.click(radios()[3] as HTMLInputElement)
    expect(checkedStep()).toBe(4)
    expect(fills(group)).toEqual([1, 1, 1, 1, 0])
    fireEvent.pointerEnter(group.querySelectorAll('label')[0] as HTMLLabelElement)
    expect(fills(group), 'the next star the pointer enters previews again').toEqual([1, 0, 0, 0, 0])
  })

  it('still calls the caller\'s onPointerLeave', () => {
    const onPointerLeave = vi.fn()
    render(<Rating readOnly={false} aria-label="Stay" onPointerLeave={onPointerLeave} />)
    fireEvent.pointerLeave(screen.getByRole('radiogroup'))
    expect(onPointerLeave).toHaveBeenCalledTimes(1)
  })

  it('disabled: no fill on hover, every radio disabled, and the row marked for the dimmed look', () => {
    render(<Rating readOnly={false} aria-label="Stay" defaultValue={2} disabled />)
    const group = screen.getByRole('radiogroup')
    fireEvent.pointerEnter(group.querySelectorAll('label')[4] as HTMLLabelElement)
    expect(fills(group)).toEqual([1, 1, 0, 0, 0])
    expect(radios().map((radio) => radio.disabled)).toEqual([true, true, true, true, true])
    expect(group.hasAttribute('data-disabled')).toBe(true)
  })
})

describe('in a form', () => {
  const sent = (form: HTMLFormElement) => [...new FormData(form)].map(([key, value]) => `${key}=${value as string}`)

  it('submits the checked step under name, and nothing when none is checked', async () => {
    render(<form aria-label="Review"><Rating readOnly={false} aria-label="Stay" name="stay" /></form>)
    const form = screen.getByRole<HTMLFormElement>('form')
    expect(sent(form)).toEqual([])
    await userEvent.click(radios()[1] as HTMLInputElement)
    expect(sent(form)).toEqual(['stay=2'])
  })

  it('a reset returns to the step it started on, and says so once', async () => {
    const onValueChange = vi.fn()
    render(<form aria-label="Review"><Rating readOnly={false} aria-label="Stay" name="stay" defaultValue={4} onValueChange={onValueChange} /></form>)
    await userEvent.click(radios()[0] as HTMLInputElement)
    expect(checkedStep()).toBe(1)
    act(() => { (screen.getByRole<HTMLFormElement>('form')).reset() })
    expect(checkedStep()).toBe(4)
    expect(fills(screen.getByRole('radiogroup'))).toEqual([1, 1, 1, 1, 0])
    expect(onValueChange.mock.calls).toEqual([[1], [4]])
  })

  it('a disabled rating submits nothing', () => {
    render(<form aria-label="Review"><Rating readOnly={false} aria-label="Stay" name="stay" defaultValue={3} disabled /></form>)
    expect(sent(screen.getByRole<HTMLFormElement>('form'))).toEqual([])
  })
})

describe('the vocabulary', () => {
  it('ref reaches the group span, the rest props and the className too', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Rating readOnly={false} aria-label="Stay" ref={ref} id="stars" data-testid="x" className="gap-3" />)
    expect(ref.current).toBe(screen.getByRole('radiogroup'))
    expect(ref.current?.id).toBe('stars')
    expect(ref.current?.getAttribute('data-testid')).toBe('x')
    expect(ref.current?.className).toBe('inline-flex flex-wrap items-center max-w-full disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 gap-3')
  })

  it('aria-labelledby names the group as well', () => {
    render(<><h2 id="t">Your stay</h2><Rating readOnly={false} aria-labelledby="t" /></>)
    expect(screen.getByRole('radiogroup', { name: 'Your stay' })).toBeDefined()
  })

  it('a read-only ref reaches its img span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Rating value={2} ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('img', { name: '2 out of 5' }))
  })
})
