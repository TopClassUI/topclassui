import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { TreeView } from '../index.js'
import type { TreeViewProps } from '../types.js'

// The tree view of the Authoring Practices, single select, in both directions; e2e/tree-view.spec.ts repeats it in Chromium.
const ITEMS = [
  {
    id: 'a', label: 'Apps', children: [
      { id: 'b', label: 'Banana', children: [{ id: 'c', label: 'Cherry' }] },
      { id: 'd', label: 'Date', disabled: true },
    ],
  },
  { id: 'e', label: 'Elder', children: [{ id: 'f', label: 'Fig' }] },
  { id: 'g', label: 'apricot' },
]

afterEach(() => { vi.restoreAllMocks() })

const tree = () => screen.getByRole('tree')
/** The label of the row aria-activedescendant names, or null when it names none. */
const active = () => {
  const id = tree().getAttribute('aria-activedescendant')
  return id === null ? null : (document.getElementById(id)?.textContent ?? '(missing)')
}
const shown = () => screen.getAllByRole('treeitem').map((row) => row.textContent)
const selected = () => screen.getAllByRole('treeitem').filter((row) => row.getAttribute('aria-selected') === 'true').map((row) => row.textContent)

const mount = (direction: 'ltr' | 'rtl', props: Partial<TreeViewProps> = {}) => render(
  <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
    <TreeView aria-label="Fruit" items={ITEMS} {...props} />
  </TopClassProvider>,
)

/** Each key pressed in turn, with the active row after it. */
async function walk(keys: string[]): Promise<(string | null)[]> {
  const seen: (string | null)[] = []
  for (const key of keys) {
    await userEvent.keyboard(key)
    seen.push(active())
  }
  return seen
}

for (const direction of ['ltr', 'rtl'] as const) {
  const [inward, outward] = direction === 'ltr' ? ['{ArrowRight}', '{ArrowLeft}'] : ['{ArrowLeft}', '{ArrowRight}']

  describe(direction, () => {
    it('Tab lands on the tree, the one tab stop, and the first row takes the highlight', async () => {
      mount(direction)
      await userEvent.tab()
      expect(document.activeElement).toBe(tree())
      expect(active()).toBe('Apps')
      expect(screen.getAllByRole('treeitem')[0]?.hasAttribute('data-highlighted')).toBe(true)
      await userEvent.tab()
      expect(document.activeElement).toBe(document.body)
    })

    it('ArrowDown and ArrowUp move through the visible rows with no wrap; Home and End go to the ends', async () => {
      mount(direction)
      await userEvent.tab()
      expect(await walk(['{ArrowUp}', '{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{End}', '{Home}', '{ArrowUp}']))
        .toEqual(['Apps', 'Elder', 'apricot', 'apricot', 'apricot', 'Apps', 'Apps'])
    })

    it(`${inward.slice(1, -1)} opens a closed branch, then moves to its first child, and does nothing on a leaf`, async () => {
      const onExpandedChange = vi.fn()
      mount(direction, { onExpandedChange })
      await userEvent.tab()
      await userEvent.keyboard(inward)
      expect(shown()).toEqual(['Apps', 'Banana', 'Date', 'Elder', 'apricot'])
      expect(onExpandedChange).toHaveBeenLastCalledWith(['a'])
      expect(await walk([inward, inward, inward, inward])).toEqual(['Banana', 'Banana', 'Cherry', 'Cherry'])
      expect(onExpandedChange).toHaveBeenLastCalledWith(['a', 'b'])
    })

    it(`${outward.slice(1, -1)} closes an open branch, else moves to the parent`, async () => {
      mount(direction, { defaultExpanded: ['a', 'b'] })
      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      expect(active()).toBe('Cherry')
      expect(await walk([outward, outward, outward, outward])).toEqual(['Banana', 'Banana', 'Apps', 'Apps'])
      expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
    })

    it('Enter selects the row and opens or closes a branch; Space selects only', async () => {
      const onValueChange = vi.fn()
      mount(direction, { onValueChange })
      await userEvent.tab()
      await userEvent.keyboard('{Enter}')
      expect(selected()).toEqual(['Apps'])
      expect(shown()).toEqual(['Apps', 'Banana', 'Date', 'Elder', 'apricot'])
      await userEvent.keyboard('{Enter}')
      expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
      await userEvent.keyboard('{ArrowDown} ')
      expect(selected()).toEqual(['Elder'])
      expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
      expect(onValueChange.mock.calls).toEqual([['a'], ['e']])
    })

    it('a letter goes to the next row it starts, wrapping; letters typed within 500 ms are one query', async () => {
      let now = 10_000
      vi.spyOn(Date, 'now').mockImplementation(() => now)
      mount(direction, { defaultExpanded: ['a'] })
      await userEvent.tab()
      const seen: (string | null)[] = []
      for (const letter of ['a', 'a', 'E']) {
        now += 600
        seen.push(...await walk([letter]))
      }
      expect(seen).toEqual(['apricot', 'Apps', 'Elder'])
      now += 600
      await userEvent.keyboard('a')
      now += 100
      await userEvent.keyboard('p')
      now += 100
      await userEvent.keyboard('p')
      expect(active()).toBe('Apps')
      now += 100
      await userEvent.keyboard('z')
      expect(active()).toBe('Apps')
      now += 600
      await userEvent.keyboard('a')
      expect(active()).toBe('apricot')
    })
  })
}

describe('which way the side arrows go is the provider\'s direction', () => {
  it('ltr: ArrowLeft on a closed root does nothing; rtl: ArrowLeft opens it', async () => {
    const { unmount } = mount('ltr')
    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
    expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
    unmount()
    mount('rtl')
    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')
    expect(shown()).toEqual(['Apps', 'Banana', 'Date', 'Elder', 'apricot'])
  })
})

describe('controlled and uncontrolled', () => {
  it('a controlled value moves only when the page passes it back; a controlled expanded likewise', async () => {
    const onValueChange = vi.fn()
    const onExpandedChange = vi.fn()
    const { rerender } = mount('ltr', { value: 'g', onValueChange, expanded: [], onExpandedChange })
    await userEvent.tab()
    expect(active()).toBe('apricot')
    await userEvent.keyboard('{Home}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('a')
    expect(onExpandedChange).toHaveBeenLastCalledWith(['a'])
    expect(selected()).toEqual(['apricot'])
    expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
    rerender(
      <TopClassProvider direction="ltr" locale="en">
        <TreeView aria-label="Fruit" items={ITEMS} value="a" onValueChange={onValueChange} expanded={['a']} onExpandedChange={onExpandedChange} />
      </TopClassProvider>,
    )
    expect(selected()).toEqual(['Apps'])
    expect(shown()).toEqual(['Apps', 'Banana', 'Date', 'Elder', 'apricot'])
  })

  it('uncontrolled, defaultValue and defaultExpanded seed it and the keys move it', async () => {
    mount('ltr', { defaultValue: 'f', defaultExpanded: ['e'] })
    expect(selected()).toEqual(['Fig'])
    await userEvent.tab()
    expect(active()).toBe('Fig')
    await userEvent.keyboard('{ArrowUp}{Enter}')
    expect(selected()).toEqual(['Elder'])
    expect(shown()).toEqual(['Apps', 'Elder', 'apricot'])
  })

  it('a space typed within 500 ms of a letter is part of the query, and selects only once the query has lapsed', async () => {
    let now = 10_000
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    const onValueChange = vi.fn()
    const items = [{ id: 'g', label: 'New folder' }, { id: 'h', label: 'New file' }, { id: 'k', label: 'Notes' }]
    render(<TreeView aria-label="Files" items={items} defaultValue="k" onValueChange={onValueChange} />)
    await userEvent.tab()
    for (const key of ['n', 'e', 'w', '[Space]', 'f', 'i', 'l']) { now += 100; await userEvent.keyboard(key) }
    expect([active(), onValueChange.mock.calls]).toEqual(['New file', []])
    now += 600
    await userEvent.keyboard('[Space]')
    expect([active(), onValueChange.mock.calls]).toEqual(['New file', [['h']]])
  })

  it('with the selected row inside a closed branch, the focus highlights the first visible row', async () => {
    mount('ltr', { defaultValue: 'c' })
    await userEvent.tab()
    expect(active()).toBe('Apps')
  })
})

