import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TreeView } from '../index.js'

// A press, a disabled row, leaving the tree, and the window: what the keyboard test does not reach.
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
const shown = () => screen.getAllByRole('treeitem').map((row) => row.textContent)
const selected = () => screen.getAllByRole('treeitem').filter((row) => row.getAttribute('aria-selected') === 'true').map((row) => row.textContent)

describe('a disabled row and a press', () => {
  it('a disabled row takes the highlight and nothing else: Enter, Space and a press select nothing', async () => {
    const onValueChange = vi.fn()
    render(<TreeView aria-label="Fruit" items={ITEMS} defaultExpanded={['a']} onValueChange={onValueChange} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(active()).toBe('Date')
    await userEvent.keyboard('{Enter} ')
    fireEvent.click(screen.getByRole('treeitem', { name: 'Date' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('treeitem', { name: 'Date' }).getAttribute('aria-disabled')).toBe('true')
  })

  it('a press does what Enter does, and highlights the row pressed', async () => {
    render(<TreeView aria-label="Fruit" items={ITEMS} />)
    await userEvent.click(screen.getByRole('treeitem', { name: 'Elder' }))
    expect(document.activeElement).toBe(tree())
    expect(selected()).toEqual(['Elder'])
    expect(shown()).toEqual(['Apps', 'Elder', 'Fig', 'apricot'])
    expect(active()).toBe('Elder')
    await userEvent.click(screen.getByRole('treeitem', { name: 'Elder' }))
    expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
  })

  it('leaving the tree takes the highlight away, and a modifier key is left to the page', async () => {
    render(<TreeView aria-label="Fruit" items={ITEMS} />)
    await userEvent.tab()
    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}')
    expect(active()).toBe('Apps')
    await userEvent.tab()
    expect(tree().hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('the caller\'s own handlers run first, and one that prevents the default keeps the key from the tree', async () => {
    const onFocus = vi.fn()
    render(<TreeView aria-label="Fruit" items={ITEMS} onFocus={onFocus} onKeyDown={(event) => { if (event.key === 'End') event.preventDefault() }} />)
    await userEvent.tab()
    expect(onFocus).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{End}')
    expect(active()).toBe('Apps')
  })

  it('a ref reaches the element with role tree', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<TreeView aria-label="Fruit" items={ITEMS} ref={ref} />)
    expect(ref.current).toBe(tree())
  })
})

/** Ten folders of a hundred files, all open: windowed. */
const big = Array.from({ length: 10 }, (_, folder) => ({
  id: `f${String(folder)}`,
  label: `Folder ${String(folder)}`,
  children: Array.from({ length: 100 }, (__, file) => ({ id: `f${String(folder)}-${String(file)}`, label: `File ${String(folder)}.${String(file)}` })),
}))
const everyFolder = big.map((node) => node.id)

describe('windowed', () => {
  it('once the highlighted row is scrolled out of the window, the tree names no row; the next key brings one back', async () => {
    render(<TreeView aria-label="Big" items={big} defaultExpanded={everyFolder} />)
    await userEvent.tab()
    expect(active()).toBe('Folder 0')
    const node = tree()
    node.scrollTop = 20_000
    act(() => { node.dispatchEvent(new Event('scroll')) })
    expect(screen.queryByRole('treeitem', { name: 'Folder 0' })).toBeNull()
    expect(node.hasAttribute('aria-activedescendant')).toBe(false)
    expect(document.activeElement).toBe(node)
    await userEvent.keyboard('{ArrowDown}')
    act(() => { node.dispatchEvent(new Event('scroll')) })
    expect(node.scrollTop).toBeLessThan(20_000)
    expect(active()).toBe('File 0.0')
  })

  it('End reaches the last of 1,010 rows, which was not mounted, and names it', async () => {
    render(<TreeView aria-label="Big" items={big} defaultExpanded={everyFolder} />)
    await userEvent.tab()
    await userEvent.keyboard('{End}')
    act(() => { tree().dispatchEvent(new Event('scroll')) })
    expect(active()).toBe('File 9.99')
    expect(screen.getAllByRole('treeitem').length).toBeLessThan(60)
  })
})
