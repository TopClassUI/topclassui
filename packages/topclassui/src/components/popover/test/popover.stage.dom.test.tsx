import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/playground.js'

describe('the playground with stage, as the docs stage draws it', () => {
  it('is open at its trigger inside its own box, not modal, and leaves the focus where it was', async () => {
    const { container } = render(<Demo stage />)
    const popup = await screen.findByRole('dialog')
    const box = container.querySelector('[data-stage]')
    const trigger = screen.getByRole('button', { name: 'Share' })
    expect(box?.contains(popup)).toBe(true)
    expect(box?.contains(trigger)).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(popup.querySelector('h2')?.textContent).toBe('Share this page')
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
    expect(popup.contains(document.activeElement)).toBe(false)
  })

  it('passes placement through to the open popup', async () => {
    render(<Demo stage placement="end-top" />)
    expect((await screen.findByRole('dialog')).getAttribute('data-placement')).toBe('end-top')
  })

  it('puts the trigger at the foot of the box for a top placement, and at its head otherwise', () => {
    const { unmount } = render(<Demo stage placement="top-start" />)
    expect(screen.getByRole('button', { name: 'Share' }).parentElement?.className).toBe('absolute inset-0 flex items-end justify-center pb-12')
    unmount()
    render(<Demo stage placement="bottom" />)
    expect(screen.getByRole('button', { name: 'Share' }).parentElement?.className).toBe('flex justify-center pt-12')
  })

  it('without stage it is the closed popover behind its trigger', () => {
    render(<Demo />)
    expect(screen.getByRole('button', { name: 'Share' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
