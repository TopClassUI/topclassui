import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/playground.js'

describe('the playground with stage, as the docs stage draws it', () => {
  it('is open at its trigger inside its own box, and leaves the focus where it was', async () => {
    const { container } = render(<Demo stage />)
    const tip = await screen.findByRole('tooltip')
    const box = container.querySelector('[data-stage]')
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    expect(box?.contains(tip)).toBe(true)
    expect(box?.contains(trigger)).toBe(true)
    expect(tip.textContent).toBe('Copy link')
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id)
    expect(tip.contains(document.activeElement)).toBe(false)
    expect(document.activeElement).not.toBe(trigger)
  })

  it('passes placement through to the open popup', async () => {
    render(<Demo stage placement="bottom-end" />)
    expect((await screen.findByRole('tooltip')).getAttribute('data-placement')).toBe('bottom-end')
  })

  it('without stage it is the trigger alone, its tooltip hidden', () => {
    render(<Demo />)
    expect(screen.getByRole('button', { name: 'Copy link' }).hasAttribute('aria-describedby')).toBe(false)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
