import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Progress } from '../index.js'

describe('in a real tree', () => {
  it('is found by its role and the name aria-label gives it', () => {
    render(<Progress aria-label="Upload" value={40} />)
    expect(screen.getByRole('progressbar', { name: 'Upload' }).getAttribute('aria-valuenow')).toBe('40')
  })

  it('is found by the name the visible text gives it through aria-labelledby', () => {
    render(
      <>
        <span id="storage-label">Storage: 7.2 GB of 10 GB</span>
        <Progress aria-labelledby="storage-label" value={72} tone="warning" />
      </>,
    )
    const bar = screen.getByRole('progressbar', { name: 'Storage: 7.2 GB of 10 GB' })
    expect(bar.getAttribute('aria-valuenow')).toBe('72')
  })

  it('sets the variable the bar reads on the element itself', () => {
    render(<Progress aria-label="Upload" value={40} />)
    expect(screen.getByRole('progressbar').style.getPropertyValue('--tc-progress-value')).toBe('40%')
  })

  it('follows a new value on re-render, because the value is the only state it has', () => {
    const { rerender } = render(<Progress aria-label="Upload" value={40} />)
    rerender(<Progress aria-label="Upload" value={180} />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('100')
    expect(bar.style.getPropertyValue('--tc-progress-value')).toBe('100%')
    expect(bar.hasAttribute('data-complete')).toBe(true)
  })

  it('drops the value when it turns indeterminate', () => {
    const { rerender } = render(<Progress aria-label="Upload" value={40} />)
    rerender(<Progress aria-label="Upload" value={40} indeterminate />)
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false)
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Progress aria-label="Upload" value={40} /><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the track, which is the progressbar', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Progress ref={ref} aria-label="Upload" value={40} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('role')).toBe('progressbar')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<Progress ref={ref} aria-label="Upload" value={40} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
