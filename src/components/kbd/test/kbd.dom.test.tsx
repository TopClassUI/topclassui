import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Kbd } from '../index.js'

describe('in a real tree', () => {
  it('is a kbd element holding its text', () => {
    const { container } = render(<Kbd>Esc</Kbd>)
    expect(container.firstElementChild?.tagName).toBe('KBD')
    expect(container.firstElementChild?.textContent).toBe('Esc')
  })

  it('is not a tab stop, because nothing about a key can be activated', async () => {
    render(<><Kbd>Esc</Kbd><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  it('keeps two sibling keys as two elements, in order, with the space between', () => {
    const { container } = render(<p><Kbd>Ctrl</Kbd> <Kbd>K</Kbd></p>)
    const keys = [...container.querySelectorAll('kbd')].map((key) => key.textContent)
    expect(keys).toEqual(['Ctrl', 'K'])
    expect(container.textContent).toBe('Ctrl K')
  })
})

describe('ref', () => {
  it('is a normal prop and receives the kbd', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Kbd ref={ref}>K</Kbd>)
    expect(ref.current?.tagName).toBe('KBD')
    expect(ref.current?.textContent).toBe('K')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLElement | null }
    const { unmount } = render(<Kbd ref={ref}>K</Kbd>)
    unmount()
    expect(ref.current).toBeNull()
  })
})
