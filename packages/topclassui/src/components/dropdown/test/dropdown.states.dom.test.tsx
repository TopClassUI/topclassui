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

  it('draws the three open menus open inside their own cells, not modal, and the closed one with none', async () => {
    const { container } = render(<Demo />)
    const [closed, open, hover, disabled] = cellsOf(container.firstElementChild)
    expect(await screen.findAllByRole('menu')).toHaveLength(3)
    expect(closed?.querySelector('[role="menu"]')).toBeNull()
    expect(closed?.querySelector('button')?.getAttribute('aria-expanded')).toBe('false')
    const rows = (cell: HTMLElement | undefined) => [...(cell?.querySelectorAll('[role="menu"][data-open] [role="menuitem"]') ?? [])]
    expect(rows(open).map((row) => row.textContent)).toEqual(['Edit', 'Delete'])
    expect(rows(hover).map((row) => [row.textContent, row.hasAttribute('data-highlighted')])).toEqual([['Edit', true], ['Delete', false]])
    expect(rows(disabled).map((row) => [row.textContent, row.getAttribute('aria-disabled')])).toEqual([['Edit', null], ['Delete', 'true']])
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
  })
})
