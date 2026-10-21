import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Skeleton } from '../index.js'

describe('in a real tree', () => {
  it('is hidden from the accessibility tree, rows and all', () => {
    const { container } = render(<Skeleton />)
    const root = container.firstElementChild
    expect(root?.getAttribute('aria-hidden')).toBe('true')
    expect(root?.children).toHaveLength(3)
    expect(root?.textContent).toBe('')
  })

  it('adds nothing a screen reader can reach, so the region around it speaks for itself', () => {
    render(<section aria-label="Invoice"><Skeleton /><Skeleton variant="card" /></section>)
    const region = within(screen.getByRole('region', { name: 'Invoice' }))
    // The hidden query finds all five spans, so the empty visible one is not vacuous.
    expect(region.queryAllByRole('generic', { hidden: true })).toHaveLength(5)
    expect(region.queryAllByRole('generic')).toEqual([])
  })

  it('is not a tab stop, on any shape', async () => {
    render(
      <>
        <Skeleton />
        <Skeleton variant="circle" />
        <Skeleton variant="rect" />
        <Skeleton variant="card" />
        <button type="button">Next</button>
      </>,
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  it('draws the rows as direct children, in order, with the last two narrowed', () => {
    const { container } = render(<Skeleton rows={4} />)
    const rows = [...(container.firstElementChild?.children ?? [])]
    expect(rows.map((row) => row.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN', 'SPAN'])
    expect(rows.map((row) => row.classList.contains('w-2/3'))).toEqual([false, false, false, true])
    expect(rows.map((row) => row.classList.contains('w-5/6'))).toEqual([false, false, true, false])
  })
})

describe('ref', () => {
  it('is a normal prop and receives the span of every shape', () => {
    for (const variant of ['text', 'circle', 'rect', 'card'] as const) {
      const ref = { current: null as HTMLSpanElement | null }
      const { unmount } = render(<Skeleton variant={variant} ref={ref} />)
      expect(ref.current?.tagName, variant).toBe('SPAN')
      expect(ref.current?.getAttribute('data-variant'), variant).toBe(variant)
      unmount()
    }
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<Skeleton ref={ref} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
