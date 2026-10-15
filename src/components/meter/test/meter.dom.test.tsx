import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Meter } from '../index.js'

describe('in a real tree', () => {
  it('is found by its role and the name aria-label gives it', () => {
    render(<Meter aria-label="Battery" value={40} />)
    expect(screen.getByRole('meter', { name: 'Battery' }).getAttribute('aria-valuenow')).toBe('40')
  })

  it('is found by the name the visible text gives it through aria-labelledby', () => {
    render(
      <>
        <span id="disk-label">Disk: 512 GB of 1 TB</span>
        <Meter aria-labelledby="disk-label" min={0} max={1024} value={512} />
      </>,
    )
    const meter = screen.getByRole('meter', { name: 'Disk: 512 GB of 1 TB' })
    expect(meter.getAttribute('aria-valuenow')).toBe('512')
    expect(meter.style.getPropertyValue('--tc-meter-value')).toBe('50%')
  })

  it('follows a new value and a new range on re-render, because they are the only state it has', () => {
    const { rerender } = render(<Meter aria-label="Battery" value={40} />)
    rerender(<Meter aria-label="Battery" min={100} max={200} value={500} />)
    const meter = screen.getByRole('meter')
    expect([meter.getAttribute('aria-valuemin'), meter.getAttribute('aria-valuemax'), meter.getAttribute('aria-valuenow')])
      .toEqual(['100', '200', '200'])
    expect(meter.style.getPropertyValue('--tc-meter-value')).toBe('100%')
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Meter aria-label="Battery" value={40} /><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the track, which is the meter', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Meter ref={ref} aria-label="Battery" value={40} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('role')).toBe('meter')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<Meter ref={ref} aria-label="Battery" value={40} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
