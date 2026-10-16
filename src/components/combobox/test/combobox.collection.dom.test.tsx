import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as Shared from '#shared/collection/use-collection.js'

// What the list part hands the shared hook (R-8.5-1, R-5.7-7), and each scroll to a row with the row height of its render.
const seen: Shared.UseCollectionOptions<unknown>[] = []
const scrolled: { index: number; block: string | undefined; unit: number | undefined }[] = []
vi.mock('#shared/collection/use-collection.js', async (load) => {
  const real = await load<typeof Shared>()
  return {
    useCollection: (props: Shared.UseCollectionOptions<unknown>) => {
      seen.push(props)
      const result = real.useCollection(props)
      const scrollToIndex: typeof result.scrollToIndex = (index, block) => {
        scrolled.push({ index, block, unit: props.estimateRowHeight })
        result.scrollToIndex(index, block)
      }
      return { ...result, scrollToIndex }
    },
  }
})

const { Combobox } = await import('../index.js')

afterEach(() => { seen.length = 0; scrolled.length = 0 })

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

  it('a page is counted by the options loaded, not by the matches the query leaves', async () => {
    render(<Combobox aria-label="L" items={ITEMS} hasMore loadMore={() => undefined} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByRole('combobox'), 'Br')
    expect(last()?.items).toHaveLength(1)
    expect(last()?.loadedCount).toBe(2)
  })

  it('kept mounted while closed, the list asks for nothing; open, it asks', async () => {
    const loadMore = vi.fn()
    render(<Combobox aria-label="L" items={ITEMS} hasMore loadMore={loadMore} keepMounted />)
    expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(2)
    expect(loadMore).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('combobox'))
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('opened on the chosen value, the list scrolls to it with the measured row height, never the 40 px estimate', async () => {
    const style = document.head.appendChild(document.createElement('style'))
    style.textContent = '[role="option"] { height: 44px }'
    render(<Combobox aria-label="L" items={ITEMS} defaultValue="b" />)
    await userEvent.click(screen.getByRole('combobox'))
    style.remove()
    expect(scrolled).toEqual([{ index: 1, block: 'center', unit: 44 }])
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
