import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DatePicker } from '../index.js'

const open = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Check-in' }))
  return screen.findByRole('grid')
}

describe('a calendar open on the first render', () => {
  it('leaves the focus where it was, so a page that draws it open is not scrolled to it; once reopened, the day takes it', async () => {
    render(<DatePicker aria-label="Check-in" defaultValue="2026-09-22" defaultOpen modal={false} />)
    const grid = await screen.findByRole('grid')
    await act(async () => { await new Promise((done) => requestAnimationFrame(() => { done(undefined) })) })
    expect(document.activeElement).toBe(document.body)
    expect(grid.contains(document.activeElement)).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => { expect(screen.queryByRole('grid')).toBeNull() })
    const again = await open()
    await waitFor(() => { expect(document.activeElement).toBe(within(again).getByRole('button', { name: 'Tuesday, September 22, 2026' })) })
  })
})
