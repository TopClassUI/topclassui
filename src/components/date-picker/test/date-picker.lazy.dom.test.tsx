import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '../index.js'

// The calendar part is held until the test lets it go, as a slow network holds the chunk.
const gate = vi.hoisted(() => {
  let release = (): void => undefined
  const held = new Promise<void>((resolve) => { release = resolve })
  return { held, release: () => { release() } }
})

vi.mock('../parts/date-picker-calendar.js', async (original) => {
  await gate.held
  return original()
})

const trigger = () => screen.getByRole('button', { name: 'Check-in' })

describe('a close while the calendar part is still loading', () => {
  it('leaves nothing to mount later: no dialog, the focus on the trigger, and the next open works', async () => {
    render(<DatePicker aria-label="Check-in" name="checkIn" defaultValue="2026-09-22" />)
    await userEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    gate.release()
    await act(async () => {
      await import('../parts/date-picker-calendar.js')
      await new Promise((resolve) => { setTimeout(resolve, 50) })
    })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger())
    await userEvent.click(trigger())
    await screen.findByRole('grid')
    await waitFor(() => { expect(document.activeElement?.getAttribute('aria-label')).toBe('Tuesday, September 22, 2026') })
  })
})
