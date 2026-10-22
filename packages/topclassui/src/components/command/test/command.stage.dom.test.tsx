import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/playground.js'

describe('the playground with stage, as the docs stage draws it', () => {
  it('draws the open palette in its own box as a picture: "but" typed, the first match active, hidden from a reader', () => {
    const { container } = render(<Demo stage />)
    const box = container.querySelector('[data-stage]')
    const picture = box?.firstElementChild
    expect(picture?.getAttribute('aria-hidden')).toBe('true')
    expect(picture?.textContent).toBe('butEscComponentsButtonButton group')
    expect([...(box?.querySelectorAll('[data-highlighted]') ?? [])].map((row) => row.textContent)).toEqual(['Button'])
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('with stage and defaultOpen from Try it it is the live palette, open with its list', async () => {
    render(<Demo stage defaultOpen />)
    const palette = await screen.findByRole('dialog', {}, { timeout: 15_000 })
    expect(palette.querySelector('[role="option"]')?.textContent).toBe('Button')
  })

  it('without stage it is the closed palette behind its Search button', () => {
    render(<Demo />)
    expect(screen.getByRole('button', { name: 'Search' })).not.toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
