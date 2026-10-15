import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Stepper } from '../index.js'
import type { StepperItem } from '../types.js'

const FOUR: StepperItem[] = [
  { id: 'account', title: 'Account' },
  { id: 'profile', title: 'Profile' },
  { id: 'team', title: 'Team' },
  { id: 'done', title: 'Done' },
]

/** The text a screen reader reaches: everything but what aria-hidden takes out. */
const heard = (item: HTMLElement) => {
  const copy = item.cloneNode(true) as HTMLElement
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
}

describe('in a real tree', () => {
  it('is a named list of four items, each heard as its title and its status, never its number', () => {
    render(<Stepper items={FOUR} value="profile" aria-label="Sign-up" />)
    const items = within(screen.getByRole('list', { name: 'Sign-up' })).getAllByRole('listitem')
    expect(items.map(heard)).toEqual(['AccountCompleted', 'Profile', 'TeamNot started', 'DoneNot started'])
  })

  it('gives the circles to no one: the number and the tick are hidden, the list says the position', () => {
    render(<Stepper items={FOUR} value="profile" />)
    const hidden = screen.getAllByRole('listitem').map((item) => item.querySelector('[aria-hidden="true"].rounded-full')?.textContent)
    expect(hidden).toEqual(['', '2', '3', '4'])
  })

  it('exposes the current step, and only that one', () => {
    render(<Stepper items={FOUR} value="team" />)
    const current = screen.getAllByRole('listitem').filter((item) => item.hasAttribute('aria-current'))
    expect(current.map((item) => [heard(item), item.getAttribute('aria-current')])).toEqual([['Team', 'step']])
  })

  it('carries the list role as an attribute, not only as the implicit role of an ol', () => {
    render(<Stepper items={FOUR} />)
    expect(screen.getByRole('list').getAttribute('role')).toBe('list')
  })

  it('renders no list when there are no steps', () => {
    const { container } = render(<Stepper items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('holds nothing focusable of its own', () => {
    const { container } = render(<Stepper items={FOUR} value="team" />)
    expect(container.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0)
  })

  it('keeps each row when the list is reversed, because the key is the step id', () => {
    const { rerender } = render(<Stepper items={FOUR} value="none" />)
    const before = screen.getAllByRole('listitem')
    rerender(<Stepper items={[...FOUR].reverse()} value="none" />)
    const after = screen.getAllByRole('listitem')
    expect(after[3]).toBe(before[0])
    expect(after[0]).toBe(before[3])
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root list', () => {
    const ref = { current: null as HTMLOListElement | null }
    render(<Stepper ref={ref} items={FOUR} />)
    expect(ref.current?.tagName).toBe('OL')
    expect(ref.current?.children).toHaveLength(4)
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLOListElement | null }
    const { unmount } = render(<Stepper ref={ref} items={FOUR} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
