import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as Shared from '#shared/collection/use-collection.js'
import type { CollectionProps } from '#shared/contracts/collection.js'

// What the list part hands the shared hook (R-8.5-1, R-5.7-7), read by a spy that passes every call through.
const seen: CollectionProps<unknown>[] = []
vi.mock('#shared/collection/use-collection.js', async (load) => {
  const real = await load<typeof Shared>()
  return { useCollection: (props: CollectionProps<unknown>) => { seen.push(props); return real.useCollection(props) } }
})

const { Combobox } = await import('../index.js')

afterEach(() => { seen.length = 0 })

const ITEMS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }]
const last = () => seen.at(-1)

describe('the list is the shared collection', () => {
  it('nothing reaches it while the list is closed: the hook runs in the part that mounts with the popup', () => {
    render(<Combobox aria-label="L" items={ITEMS} />)
    expect(seen).toEqual([])
  })

  it('loadMoreThreshold is clamped to 0 and 200 before it reaches useCollection (R-5.7-7)', async () => {
    render(<><Combobox aria-label="High" items={ITEMS} loadMoreThreshold={9999} /><Combobox aria-label="Low" items={ITEMS} loadMoreThreshold={-5} /></>)
    await userEvent.click(screen.getByRole('combobox', { name: 'High' }))
    expect(last()?.loadMoreThreshold).toBe(200)
    // Open, Base UI hides everything else from assistive technology, the other input too.
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('combobox', { name: 'Low' }))
    expect(last()?.loadMoreThreshold).toBe(0)
  })

  it('the filtered options, keyed by value, with virtualize auto and a row of 40 px until one is measured', async () => {
    render(<Combobox aria-label="L" items={ITEMS} />)
    await userEvent.click(screen.getByRole('combobox'))
    const props = last()
    expect(props?.items).toEqual(ITEMS)
    expect(props?.getKey(ITEMS[1])).toBe('b')
    expect(props?.virtualize).toBe('auto')
    expect(seen[0]?.estimateRowHeight).toBe(40)
    await userEvent.type(screen.getByRole('combobox'), 'Br')
    expect(last()?.items).toEqual([ITEMS[1]])
  })

  it('hasMore and loadMore reach it from the first render: the shared hook itself waits until it has read the list', async () => {
    const loadMore = () => undefined
    render(<Combobox aria-label="L" items={ITEMS} hasMore loadMore={loadMore} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(seen[0]?.hasMore).toBe(true)
    expect(seen[0]?.loadMore).toBe(loadMore)
  })

  it('visibleRows is clamped to 1 and 20 and set on the list as --tc-list-rows; left out, no style is written', async () => {
    render(<><Combobox aria-label="Many" items={ITEMS} visibleRows={50} /><Combobox aria-label="Knob" items={ITEMS} /></>)
    await userEvent.click(screen.getByRole('combobox', { name: 'Many' }))
    expect(screen.getByRole('listbox').style.getPropertyValue('--tc-list-rows')).toBe('20')
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('combobox', { name: 'Knob' }))
    expect(screen.getByRole('listbox').style.getPropertyValue('--tc-list-rows')).toBe('')
  })
})
