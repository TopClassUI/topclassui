import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/playground.js'

describe('the playground with stage, as the docs stage draws it', () => {
  it('is open under its trigger inside its own box, and not modal', async () => {
    const { container } = render(<Demo stage />)
    const menu = await screen.findByRole('menu')
    const box = container.querySelector('[data-stage]')
    expect(box?.contains(menu)).toBe(true)
    expect(box?.contains(screen.getByRole('button', { name: 'Actions' }))).toBe(true)
    expect(menu.hasAttribute('data-open')).toBe(true)
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
    expect([...menu.querySelectorAll('[role="menuitem"]')].map((row) => row.textContent)).toEqual(['ProfileCtrl P', 'Settings', 'Duplicate', 'DeleteDel'])
  })

  it('without stage it is the closed menu behind its trigger', () => {
    const { container } = render(<Demo />)
    expect(screen.getByRole('button', { name: 'Actions' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(container.querySelector('[data-stage]')).toBeNull()
  })
})
