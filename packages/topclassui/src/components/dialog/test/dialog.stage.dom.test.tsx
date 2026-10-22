import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/playground.js'

describe('the playground with stage, as the docs stage draws it', () => {
  it('is open inside its own box over its own scrim, not modal, and leaves the focus where it was', async () => {
    const { container } = render(<Demo stage />)
    const popup = await screen.findByRole('dialog')
    const box = container.querySelector('[data-stage]')
    expect(box?.contains(popup)).toBe(true)
    expect(popup.getAttribute('data-overlay')).not.toBeNull()
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
    expect(box?.querySelectorAll('.bg-overlay')).toHaveLength(1)
    expect(popup.contains(document.activeElement)).toBe(false)
    expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull()
  })

  it('without stage it is the closed dialog behind its trigger', () => {
    render(<Demo />)
    expect(screen.getByRole('button', { name: 'Publish' })).not.toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
