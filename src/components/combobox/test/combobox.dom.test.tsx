import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Combobox } from '../index.js'

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
  { value: 'remix', label: 'Remix' },
  { value: 'nuxt', label: 'Nuxt' },
]

const input = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Framework' })
const options = () => screen.queryAllByRole('option').map((option) => option.textContent)
const hidden = () => document.querySelector<HTMLInputElement>('input[name="framework"]')
// Base UI's live regions end their text in a word joiner, so a repeat of the same words is announced again.
const statuses = () => screen.getAllByRole('status').map((status) => status.textContent.replace('⁠', ''))

describe('typing filters, and Enter chooses', () => {
  it('typing narrows the list by "contains", in any case', async () => {
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} />)
    await userEvent.click(input())
    expect(options()).toEqual(['Next.js', 'Astro', 'Remix', 'Nuxt'])
    await userEvent.type(input(), 'X')
    expect(options()).toEqual(['Next.js', 'Remix', 'Nuxt'])
  })

  it('ArrowDown highlights a row, Enter chooses it: the input shows its label, onValueChange gets its value', async () => {
    const onValueChange = vi.fn<(next: string | null) => void>()
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} name="framework" onValueChange={onValueChange} />)
    await userEvent.click(input())
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['astro'])
    expect(input().value).toBe('Astro')
    expect(hidden()?.value).toBe('astro')
  })

  it('a value the caller cancels is not taken', async () => {
    const onValueChange = vi.fn((_next: string | null, details: { cancel: () => void }) => { details.cancel() })
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} name="framework" defaultValue="next" onValueChange={onValueChange} />)
    await userEvent.click(input())
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalled()
    expect(hidden()?.value).toBe('next')
  })
})

describe('an empty list, and the status', () => {
  it('a query that matches nothing says the label, and the list holds no option', async () => {
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} />)
    await userEvent.click(input())
    await userEvent.type(input(), 'zzz')
    expect(options()).toEqual([])
    expect(statuses()).toEqual(['No results', ''])
  })

  it('emptyFallback replaces the label', async () => {
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} emptyFallback="Nothing like it" />)
    await userEvent.click(input())
    await userEvent.type(input(), 'zzz')
    expect(statuses()).toEqual(['Nothing like it', ''])
  })

  it('loading with no options says Loading, not No results, and the input is busy', async () => {
    render(<Combobox aria-label="Framework" items={[]} status="loading" />)
    expect(input().getAttribute('aria-busy')).toBe('true')
    await userEvent.click(input())
    expect(statuses()).toEqual(['', 'Loading'])
  })

  it('loading-more says Loading more under the options, and the input is busy', async () => {
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} status="loading-more" />)
    expect(input().getAttribute('aria-busy')).toBe('true')
    await userEvent.click(input())
    expect(options()).toHaveLength(4)
    expect(statuses()).toEqual(['', 'Loading more'])
  })

  it('idle is not busy, and says nothing', async () => {
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} />)
    expect(input().hasAttribute('aria-busy')).toBe(false)
    await userEvent.click(input())
    expect(statuses()).toEqual(['', ''])
  })
})

describe('paging (R-8.5-2): the component asks, and never while closed', () => {
  it('loadMore is not called while the list is closed, and once when it opens at its end', async () => {
    const loadMore = vi.fn()
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} hasMore loadMore={loadMore} />)
    await act(async () => { await Promise.resolve() })
    expect(loadMore).not.toHaveBeenCalled()
    await userEvent.click(input())
    expect(loadMore).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('without hasMore it never asks', async () => {
    const loadMore = vi.fn()
    render(<Combobox aria-label="Framework" items={FRAMEWORKS} loadMore={loadMore} />)
    await userEvent.click(input())
    expect(loadMore).not.toHaveBeenCalled()
  })
})
