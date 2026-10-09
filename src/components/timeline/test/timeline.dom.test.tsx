import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Timeline } from '../index.js'
import type { TimelineItem } from '../types.js'

type Event = TimelineItem & { id: string }
const key = (event: Event) => event.id

const EVENTS: Event[] = [
  { id: 'a', title: 'Created', time: 'Monday', status: 'done' },
  { id: 'b', title: 'In review', time: 'Today', status: 'current' },
  { id: 'c', title: 'Launch', status: 'todo' },
]

describe('in a real tree', () => {
  it('is a list of three items, each read as its status, its title and its time', () => {
    render(<Timeline items={EVENTS} getKey={key} aria-label="Activity" />)
    const items = within(screen.getByRole('list', { name: 'Activity' })).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['DoneCreatedMonday', 'CurrentIn reviewToday', 'Not startedLaunch'])
  })

  it('exposes the current step, and only that one', () => {
    render(<Timeline items={EVENTS} getKey={key} />)
    const current = screen.getAllByRole('listitem').filter((item) => item.hasAttribute('aria-current'))
    expect(current.map((item) => [item.textContent, item.getAttribute('aria-current')])).toEqual([['CurrentIn reviewToday', 'step']])
  })

  it('carries the list role as an attribute, not only as the implicit role of an ol', () => {
    render(<Timeline items={EVENTS} getKey={key} />)
    expect(screen.getByRole('list').getAttribute('role')).toBe('list')
  })

  it('renders no list when there are no items', () => {
    const { container } = render(<Timeline items={[]} getKey={key} />)
    expect(screen.queryByRole('list')).toBeNull()
    expect(container.innerHTML).toBe('')
  })

  it('holds nothing focusable of its own', () => {
    const { container } = render(<Timeline items={EVENTS} getKey={key} />)
    expect(container.querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
  })

  it('keeps each row when the list is reversed, because the key is the identity of the item', () => {
    const { rerender } = render(<Timeline items={EVENTS} getKey={key} />)
    const before = screen.getAllByRole('listitem')
    rerender(<Timeline items={[...EVENTS].reverse()} getKey={key} />)
    const after = screen.getAllByRole('listitem')
    expect(after.map((item) => item.textContent)).toEqual(['Not startedLaunch', 'CurrentIn reviewToday', 'DoneCreatedMonday'])
    expect(after[2]).toBe(before[0])
    expect(after[0]).toBe(before[2])
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root list', () => {
    const ref = { current: null as HTMLOListElement | null }
    render(<Timeline ref={ref} items={EVENTS} getKey={key} />)
    expect(ref.current?.tagName).toBe('OL')
    expect(ref.current?.children).toHaveLength(3)
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLOListElement | null }
    const { unmount } = render(<Timeline ref={ref} items={EVENTS} getKey={key} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
