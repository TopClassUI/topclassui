import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Alert } from '../index.js'

describe('in a real tree', () => {
  it('is read as its text, with no role of its own', () => {
    render(<Alert title="Saved">Stored.</Alert>)
    expect(screen.getByText('Saved').closest('[data-variant]')?.getAttribute('role')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('exposes the alert role when the caller passes it', () => {
    render(<Alert role="alert" title="Declined">Use another card.</Alert>)
    expect(screen.getByRole('alert').textContent).toBe('DeclinedUse another card.')
  })

  it('keeps the icon out of the accessibility tree, so the title is what is read', () => {
    const { container } = render(<Alert title="Saved" />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('is not a tab stop, but its actions are, in reading order', async () => {
    const actions = <><button type="button">Retry</button><button type="button">Logs</button></>
    render(<Alert title="Failed" actions={actions}>The deploy stopped.</Alert>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Retry' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Logs' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Alert ref={ref} title="Saved" />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('data-variant')).toBe('soft')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<Alert ref={ref} title="Saved" />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
