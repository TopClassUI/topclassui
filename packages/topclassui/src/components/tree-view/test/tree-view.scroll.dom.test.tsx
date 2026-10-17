import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TreeView } from '../index.js'

// What a wheel leaves behind: the highlighted row still mounted, but out of the box the tree shows.
const ITEMS = [
  { id: 'a', label: 'Apps', children: [{ id: 'b', label: 'Banana' }, { id: 'd', label: 'Date', disabled: true }] },
  { id: 'e', label: 'Elder', children: [{ id: 'f', label: 'Fig' }] },
  { id: 'g', label: 'apricot' },
]

const tree = () => screen.getByRole('tree')
/** The label of the row aria-activedescendant names, or null when it names none. */
const active = () => {
  const id = tree().getAttribute('aria-activedescendant')
  return id === null ? null : (document.getElementById(id)?.textContent ?? '(missing)')
}

describe('a wheel that leaves the highlighted row mounted but out of sight', () => {
  /** A layout happy-dom does not have: the tree shows 80 px from its top, and each row is 40 px below the one before. */
  const lay = () => {
    const node = tree()
    Object.defineProperty(node, 'clientHeight', { configurable: true, value: 80 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function rect(this: HTMLElement) {
      const index = Number(this.dataset['index'] ?? '-1')
      const top = this === node || index < 0 ? 0 : index * 40 - node.scrollTop
      return DOMRect.fromRect({ x: 0, y: top, width: 200, height: this === node ? 80 : 40 })
    })
  }
  const scrollTo = (top: number) => {
    tree().scrollTop = top
    act(() => { tree().dispatchEvent(new Event('scroll')) })
  }

  it('marks the tree, so it draws its own ring, and keeps naming the row; scrolled back, the mark goes', async () => {
    render(<TreeView aria-label="Fruit" items={ITEMS} defaultExpanded={['a', 'e']} />)
    lay()
    await userEvent.tab()
    expect([active(), tree().hasAttribute('data-highlight-hidden')]).toEqual(['Apps', false])
    scrollTo(30)
    expect(tree().hasAttribute('data-highlight-hidden')).toBe(false)
    scrollTo(40)
    expect([active(), tree().hasAttribute('data-highlight-hidden')]).toEqual(['Apps', true])
    scrollTo(0)
    expect(tree().hasAttribute('data-highlight-hidden')).toBe(false)
  })

  it('a row below the box is out of sight too, and with no highlight nothing is', async () => {
    render(<TreeView aria-label="Fruit" items={ITEMS} defaultExpanded={['a', 'e']} defaultValue="g" />)
    lay()
    await userEvent.tab()
    expect(active()).toBe('apricot')
    expect(tree().hasAttribute('data-highlight-hidden')).toBe(true)
    act(() => { tree().blur() })
    expect(tree().hasAttribute('data-highlight-hidden')).toBe(false)
  })
})
