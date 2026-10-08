import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Badge, BadgeSkeleton } from '../index.js'

describe('in a real tree', () => {
  it('is read as its text, with no role of its own', () => {
    render(<Badge>Paid</Badge>)
    expect(screen.getByText('Paid').closest('[data-variant]')?.getAttribute('role')).toBeNull()
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Badge>Paid</Badge><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  it('keeps the skeleton out of the accessibility tree', () => {
    const { container } = render(<BadgeSkeleton />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('ref', () => {
  it('is a normal prop and receives the span', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Badge ref={ref}>Paid</Badge>)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('data-variant')).toBe('soft')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<Badge ref={ref}>Paid</Badge>)
    unmount()
    expect(ref.current).toBeNull()
  })

  it('reaches the skeleton span too, because a skeleton is a component', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<BadgeSkeleton ref={ref} />)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true')
  })
})
