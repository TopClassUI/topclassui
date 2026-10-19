import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/states.js'

/** Each direct child of the demo's root is one state, captioned by its title. */
const cellsOf = (root: Element | null) => [...(root?.children ?? [])] as HTMLElement[]

describe('the states demo, one cell per state of the Every state strip', () => {
  it('draws closed, open, alert and scrolled, in that order, each captioned by its title', () => {
    const { container } = render(<Demo />)
    expect(cellsOf(container.firstElementChild).map((cell) => cell.getAttribute('title'))).toEqual(['closed', 'open', 'alert', 'scrolled'])
  })

  it('draws three dialogs open inside their own cells over a scrim, not modal, and leaves the focus where it was', async () => {
    const { container } = render(<Demo />)
    const [closed, ...open] = cellsOf(container.firstElementChild)
    expect(await screen.findAllByRole('dialog')).toHaveLength(3)
    expect(closed?.querySelector('[role="dialog"]')).toBeNull()
    expect(closed?.querySelector('button')?.textContent).toBe('Open')
    const titles = open.map((cell) => cell.querySelector('[role="dialog"][data-open] h2')?.textContent)
    expect(titles).toEqual(['Publish changes', 'Delete this project?', 'Scrolled'])
    expect(open.map((cell) => cell.querySelectorAll('.bg-overlay').length)).toEqual([1, 1, 1])
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
    expect(document.activeElement).toBe(document.body)
  })

  it('draws the alert with no x and its two answers, and the open dialog with its x', async () => {
    const { container } = render(<Demo />)
    const [, open, alert] = cellsOf(container.firstElementChild)
    await screen.findAllByRole('dialog')
    const names = (cell: HTMLElement | undefined) => [...(cell?.querySelectorAll('[role="dialog"] button') ?? [])].map((button) => button.getAttribute('aria-label') ?? button.textContent)
    expect(names(alert)).toEqual(['Cancel', 'Delete'])
    expect(names(open)).toEqual(['Close this dialog', 'Cancel', 'Publish now'])
  })
})
