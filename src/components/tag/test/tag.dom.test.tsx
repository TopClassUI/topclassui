import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tag } from '../index.js'

describe('in a real tree', () => {
  it('is read as its text, with no role of its own', () => {
    render(<Tag>React</Tag>)
    expect(screen.getByText('React').closest('[data-tone]')?.getAttribute('role')).toBeNull()
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Tag>React</Tag><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  it('holds no button, because the remove control is the client half', () => {
    render(<Tag>React</Tag>)
    expect(screen.queryAllByRole('button')).toEqual([])
  })
})

describe('ref', () => {
  it('is a normal prop and receives the span', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Tag ref={ref}>React</Tag>)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('data-tone')).toBe('neutral')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<Tag ref={ref}>React</Tag>)
    unmount()
    expect(ref.current).toBeNull()
  })
})
