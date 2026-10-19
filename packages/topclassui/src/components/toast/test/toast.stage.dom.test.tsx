import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { ToastStage, toast } from '../index.js'
import type { ToastStageToast } from '../types.js'

afterEach(() => { vi.useRealTimers() })

const FRAME: ToastStageToast = { tone: 'success', title: 'Project created', description: 'You can invite your team now.' }

const stage = (shown: ToastStageToast = FRAME) => (
  <TopClassProvider direction="ltr" locale="en">
    <ToastStage toast={shown} data-testid="stage">
      <button type="button">Show a toast</button>
    </ToastStage>
  </TopClassProvider>
)

const inStage = () => [...screen.getByTestId('stage').querySelectorAll('[role="dialog"]')]

describe('ToastStage', () => {
  it('shows its toast at rest inside its own box, after what the box holds, with no portal', async () => {
    render(stage())
    expect(await screen.findByRole('heading', { name: 'Project created' })).toBeTruthy()
    expect(inStage()).toHaveLength(1)
    expect(screen.getByTestId('stage').firstElementChild?.textContent).toBe('Show a toast')
    expect(inStage()[0]?.getAttribute('data-type')).toBe('success')
    expect(inStage()[0]?.textContent).toContain('You can invite your team now.')
  })

  it('keeps the x, so the toast at rest can be dismissed', async () => {
    render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    act(() => { screen.getByRole('button', { name: 'Dismiss this notification' }).click() })
    await waitFor(() => { expect(screen.queryByRole('heading', { name: 'Project created' })).toBeNull() })
  })

  it('stays until closed when the options give no duration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(inStage()).toHaveLength(1)
  })

  it('takes the new options in place of the old toast, never beside it', async () => {
    const { rerender } = render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    rerender(stage({ ...FRAME, tone: 'danger' }))
    await waitFor(() => { expect(inStage().filter((root) => root.getAttribute('data-type') === 'danger')).toHaveLength(1) })
    await waitFor(() => { expect(inStage().filter((root) => root.getAttribute('data-type') === 'success')).toHaveLength(0) })
  })

  it('leaves toast.add to the page: a toast added by the call lands in the corner, not in the stage', async () => {
    render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    act(() => { toast.add({ title: 'Draft saved' }) })
    expect(await screen.findByRole('heading', { name: 'Draft saved' })).toBeTruthy()
    expect(inStage().map((root) => root.querySelector('h2')?.textContent)).toEqual(['Project created'])
  })

  it('names its column apart from the page\'s, so the two landmarks differ', async () => {
    render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    expect(screen.getByRole('region', { name: 'Example notifications' }).contains(inStage()[0] ?? null)).toBe(true)
  })

  it('draws its column at the bottom-end of the box, never fixed to the screen', async () => {
    render(stage())
    await screen.findByRole('heading', { name: 'Project created' })
    const column = screen.getByTestId('stage').querySelector('[role="region"]')
    expect(column?.className.split(' ')).toEqual(expect.arrayContaining(['absolute', 'bottom-0', 'inset-e-0']))
    expect(column?.className.split(' ')).not.toContain('fixed')
    expect(screen.getByTestId('stage').className.split(' ')).toEqual(['relative', 'isolate'])
  })
})
