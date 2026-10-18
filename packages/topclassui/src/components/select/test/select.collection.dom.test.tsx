import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select } from '../index.js'
import type { SelectProps } from '../types.js'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco', disabled: true }]

function Country(props: Partial<SelectProps>) {
  return <Select aria-label="Country" name="country" items={ITEMS} {...props} />
}

const trigger = () => screen.getByRole('combobox')

describe('paging (R-8.5-1): the open list asks for the next page, and never while closed', () => {
  it('loadMore is not called while closed, and once when the list opens at its end', async () => {
    const loadMore = vi.fn()
    render(<Country hasMore loadMore={loadMore} />)
    await new Promise((resolve) => { setTimeout(resolve, 20) })
    expect(loadMore).not.toHaveBeenCalled()
    await userEvent.click(trigger())
    await screen.findByRole('option', { name: 'Egypt' })
    await waitFor(() => { expect(loadMore).toHaveBeenCalledTimes(1) })
    await userEvent.keyboard('{ArrowDown}')
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('without hasMore it never asks', async () => {
    const loadMore = vi.fn()
    render(<Country loadMore={loadMore} />)
    await userEvent.click(trigger())
    await screen.findByRole('option', { name: 'Egypt' })
    expect(loadMore).not.toHaveBeenCalled()
  })

  it('every option stays mounted, the rows come from useCollection, and a duplicate value is drawn once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const twice = [...ITEMS, { value: 'jo', label: 'Jordan again' }]
    render(<Country items={twice} />)
    await userEvent.click(trigger())
    await screen.findByRole('option', { name: 'Egypt' })
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Jordan', 'Egypt', 'Morocco'])
    warn.mockRestore()
  })

  it('above the windowing threshold it warns once in development, pointing to Combobox', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const many = Array.from({ length: 201 }, (_, at) => ({ value: String(at), label: `Option ${String(at)}` }))
    render(<Country items={many} />)
    expect(warn.mock.calls.filter((call) => String(call[0]).includes('Combobox'))).toHaveLength(1)
    warn.mockRestore()
  })
})
