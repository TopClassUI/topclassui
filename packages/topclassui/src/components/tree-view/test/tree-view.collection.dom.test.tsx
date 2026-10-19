import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as Shared from '#shared/collection/use-collection.js'
import type { CollectionProps } from '#shared/contracts/collection.js'
import type { TreeNode } from '../types.js'

// What the tree hands the shared hook (R-8.5-1, R-5.7-7), read by a spy that passes every call through.
const seen: CollectionProps<unknown>[] = []
vi.mock('#shared/collection/use-collection.js', async (load) => {
  const real = await load<typeof Shared>()
  return { useCollection: (props: CollectionProps<unknown>) => { seen.push(props); return real.useCollection(props) } }
})

const { TreeView } = await import('../index.js')

afterEach(() => { seen.length = 0 })

const ITEMS: TreeNode[] = [{ id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] }, { id: 'b', label: 'B' }]
const last = () => seen.at(-1)

describe('the rows are the shared collection', () => {
  it('the visible rows, keyed by id, with virtualize auto and a row of 32 px until one is measured', () => {
    render(<TreeView aria-label="T" items={ITEMS} defaultExpanded={['a']} />)
    const props = last()
    expect((props?.items as { node: TreeNode }[]).map((row) => row.node.id)).toEqual(['a', 'a1', 'b'])
    expect(props?.getKey(props.items[1])).toBe('a1')
    expect(props?.virtualize).toBe('auto')
    expect(seen[0]?.estimateRowHeight).toBe(32)
  })

  it('loadMoreThreshold is clamped to 0 and 200 before it reaches useCollection (R-5.7-7)', () => {
    render(<TreeView aria-label="High" items={ITEMS} loadMoreThreshold={9999} />)
    expect(last()?.loadMoreThreshold).toBe(200)
    render(<TreeView aria-label="Low" items={ITEMS} loadMoreThreshold={-5} />)
    expect(last()?.loadMoreThreshold).toBe(0)
  })

  it('hasMore reaches it only once the tree has been read at its count, so an unmeasured tree asks for nothing', () => {
    render(<TreeView aria-label="T" items={ITEMS} hasMore loadMore={() => undefined} />)
    expect(seen[0]?.hasMore).toBe(false)
    expect(last()?.hasMore).toBe(true)
  })

  it('no loadMore reaches it when the caller gave none', () => {
    render(<TreeView aria-label="T" items={ITEMS} hasMore />)
    expect(last()?.loadMore).toBeUndefined()
  })
})

/** Root folders a page at a time; the test settles each page by hand. */
function Paged({ onAsk }: { onAsk: () => Promise<void> }) {
  const [items, setItems] = useState<TreeNode[]>([
    { id: 'r1', label: 'Root 1', children: [{ id: 'r1a', label: 'Child' }] },
    { id: 'r2', label: 'Root 2' },
  ])
  const loadMore = async () => {
    await onAsk()
    setItems((current) => [...current, { id: `r${String(current.length + 1)}`, label: `Root ${String(current.length + 1)}` }])
  }
  return <TreeView aria-label="Paged" items={items} hasMore={items.length < 4} loadMore={loadMore} />
}

describe('paging asks once per page of root nodes (R-8.5-2)', () => {
  it('opening and closing a branch while a page is on its way asks for nothing more; the next page asks once', async () => {
    const settle: (() => void)[] = []
    const onAsk = vi.fn(() => new Promise<void>((resolve) => { settle.push(resolve) }))
    render(<Paged onAsk={onAsk} />)
    // happy-dom lays nothing out, so the tree is at its end from the start.
    await waitFor(() => { expect(onAsk).toHaveBeenCalledTimes(1) })
    fireEvent.click(screen.getByRole('treeitem', { name: 'Root 1' }))
    expect(screen.getAllByRole('treeitem')).toHaveLength(3)
    fireEvent.click(screen.getByRole('treeitem', { name: 'Root 1' }))
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
    await act(async () => { await Promise.resolve() })
    expect(onAsk).toHaveBeenCalledTimes(1)
    await act(async () => { settle[0]?.(); await Promise.resolve() })
    await waitFor(() => { expect(screen.getAllByRole('treeitem')).toHaveLength(3) })
    await waitFor(() => { expect(onAsk).toHaveBeenCalledTimes(2) })
    await act(async () => { settle[1]?.(); await Promise.resolve() })
    await waitFor(() => { expect(screen.getAllByRole('treeitem')).toHaveLength(4) })
    await act(async () => { await Promise.resolve() })
    expect(onAsk).toHaveBeenCalledTimes(2)
  })

  it('a page that fails may be asked for again', async () => {
    const loadMore = vi.fn(() => Promise.reject(new Error('offline')))
    const { rerender } = render(<TreeView aria-label="T" items={ITEMS} hasMore loadMore={loadMore} expanded={[]} />)
    await waitFor(() => { expect(loadMore).toHaveBeenCalledTimes(1) })
    await act(async () => { await Promise.resolve() })
    rerender(<TreeView aria-label="T" items={ITEMS} hasMore loadMore={loadMore} expanded={['a']} />)
    await waitFor(() => { expect(loadMore).toHaveBeenCalledTimes(2) })
  })
})
