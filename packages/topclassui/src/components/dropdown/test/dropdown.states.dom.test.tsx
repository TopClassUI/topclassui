import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/states.js'

/** Each direct child of the demo's root is one state, captioned by its title. */
const cellsOf = (root: Element | null) => [...(root?.children ?? [])] as HTMLElement[]

describe('the states demo, one cell per state of the Every state strip', () => {
  it('draws closed, open, a hovered row and a disabled row, in that order, each captioned by its title', () => {
    const { container } = render(<Demo />)
    expect(cellsOf(container.firstElementChild).map((cell) => cell.getAttribute('title'))).toEqual(['closed', 'open', 'hover item', 'disabled item'])
  })

  it('draws the three open ones as pictures, hidden and inert, and only the closed cell holds a real menu', () => {
    const { container } = render(<Demo />)
    const [closed, ...pictures] = cellsOf(container.firstElementChild)
    expect(screen.queryAllByRole('menu')).toHaveLength(0)
    expect(closed?.querySelector('button')?.getAttribute('aria-expanded')).toBe('false')
    const rowsOf = (cell: HTMLElement | undefined) => {
      const picture = cell?.firstElementChild
      return [picture?.getAttribute('aria-hidden'), picture?.hasAttribute('inert'), [...(picture?.children ?? [])].map((row) =>
        `${row.textContent}${row.hasAttribute('data-highlighted') ? '*' : ''}${row.hasAttribute('data-disabled') ? '-' : ''}`)]
    }
    expect(pictures.map(rowsOf)).toEqual([
      ['true', true, ['Edit', 'Delete']], ['true', true, ['Edit*', 'Delete']], ['true', true, ['Edit', 'Delete-']],
    ])
    expect(pictures.flatMap((cell) => [...cell.querySelectorAll('[role], button, a, [tabindex]')])).toHaveLength(0)
  })
})
