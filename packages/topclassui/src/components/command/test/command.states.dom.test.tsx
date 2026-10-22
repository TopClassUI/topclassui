import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import Demo from '../dummy/states.js'

/** Each direct child of the demo's root is one state, captioned by its title; the closed palette renders nothing. */
const cellsOf = (root: Element | null) => [...(root?.children ?? [])] as HTMLElement[]

describe('the states demo, one cell per state of the Every state strip', () => {
  it('draws closed, open, typing, empty, loading and selected, in that order, each captioned by its title', () => {
    const { container } = render(<Demo />)
    expect(cellsOf(container.firstElementChild).map((cell) => cell.getAttribute('title'))).toEqual([
      'closed', 'open', 'typing', 'empty', 'loading', 'selected',
    ])
  })

  it('draws the closed palette as its Ctrl K hint, in plain mono text as the frame does', () => {
    const { container } = render(<Demo />)
    const [closed] = cellsOf(container.firstElementChild)
    expect([closed?.textContent.trim(), closed?.querySelectorAll('kbd').length]).toEqual(['Ctrl K', 0])
  })

  it('draws every other cell as one picture hidden from a reader, with no role and no control in it', () => {
    const { container } = render(<Demo />)
    const pictures = cellsOf(container.firstElementChild).slice(1)
    expect(pictures.map((cell) => [cell.children.length, cell.firstElementChild?.getAttribute('aria-hidden')])).toEqual([
      [1, 'true'], [1, 'true'], [1, 'true'], [1, 'true'], [1, 'true'],
    ])
    expect(container.querySelectorAll('[role], button, input, [tabindex]')).toHaveLength(0)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('draws the query, the rows and the highlighted row of each state', () => {
    const { container } = render(<Demo />)
    const [, open, typing, empty, loading, selected] = cellsOf(container.firstElementChild)
    const rows = (cell: HTMLElement | undefined) => [...(cell?.querySelectorAll('[data-command-row]') ?? [])].map((row) => row.textContent)
    const active = (cell: HTMLElement | undefined) => [...(cell?.querySelectorAll('[data-highlighted]') ?? [])].map((row) => row.textContent)
    expect([open?.textContent, rows(open), active(open)]).toEqual(['searchButton', ['Button'], []])
    expect([typing?.textContent, rows(typing), active(typing)]).toEqual(['butButton', ['Button'], ['Button']])
    expect([rows(empty), empty?.textContent]).toEqual([[], 'no results'])
    expect([rows(loading), loading?.textContent, loading?.querySelectorAll('svg').length]).toEqual([[], '', 1])
    expect([selected?.textContent, active(selected)]).toEqual(['searchButton', ['Button']])
  })

  it('opens the real palette with Ctrl K, after the cells and uncaptioned', async () => {
    const { container } = render(<Demo />)
    await userEvent.keyboard('{Control>}k{/Control}')
    // The palette loads lazily: under the whole suite's load it takes longer than findBy's default second.
    const dialog = await screen.findByRole('dialog', {}, { timeout: 5_000 })
    expect(container.contains(dialog)).toBe(false)
    expect(cellsOf(container.firstElementChild)).toHaveLength(6)
  }, 10_000)
})
