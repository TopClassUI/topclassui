import { Toast as BaseToast } from '@base-ui/react/toast'
import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { toast } from '../index.js'

afterEach(() => { vi.useRealTimers() })

/** An app that mounts the provider and nothing else, as a root layout would. */
const app = (direction: 'ltr' | 'rtl' = 'ltr', locale = 'en') => <TopClassProvider direction={direction} locale={locale} />

/** How many entries Base UI still holds, ending ones included. */
function ListLength() {
  return <output data-testid="length">{BaseToast.useToastManager().toasts.length}</output>
}

const roots = () => [...document.querySelectorAll('[role="region"] > [role="dialog"], [role="region"] > [role="alertdialog"]')]
const titles = () => roots().map((root) => root.querySelector('h2')?.textContent)
const shown = (title: string) => screen.findByRole('heading', { name: title })

describe('toast.add, with nothing but TopClassProvider mounted', () => {
  it('shows the toast: the provider mounts the viewport itself', async () => {
    render(app())
    act(() => { toast.add({ title: 'Project created' }) })
    expect(await shown('Project created')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Notifications' }).contains(roots()[0] ?? null)).toBe(true)
  })

  it('is neutral by default, which draws no icon', async () => {
    render(app())
    act(() => { toast.add({ title: 'Draft saved' }) })
    await shown('Draft saved')
    expect(roots()[0]?.getAttribute('data-type')).toBe('neutral')
    expect(roots()[0]?.querySelectorAll('svg')).toHaveLength(1)
  })

  it('draws the icon of its tone in a box that carries the colour, never on the svg', async () => {
    render(app())
    act(() => { toast.add({ tone: 'success', title: 'Invitation sent' }) })
    await shown('Invitation sent')
    const box = roots()[0]?.firstElementChild
    expect(box?.tagName).toBe('SPAN')
    expect(box?.className).toBe('col-start-1 row-start-1 me-3 flex h-5 shrink-0 items-center @max-3xs:mb-2 text-success-on-soft')
    expect(box?.querySelector('svg')?.getAttribute('class')).toBe('inline-block shrink-0')
  })
})

describe('update, close and promise reach the toast add() made', () => {
  it('update changes the text and the tone, and close by id closes that one only', async () => {
    render(app())
    let id = ''
    act(() => { id = toast.add({ title: 'Uploading' }); toast.add({ title: 'Other' }) })
    await shown('Uploading')
    act(() => { toast.update(id, { title: 'Uploaded', tone: 'success' }) })
    expect(await shown('Uploaded')).toBeTruthy()
    act(() => { toast.close(id) })
    await waitFor(() => { expect(titles()).toEqual(['Other']) })
  })

  it('close with no id closes every toast', async () => {
    render(app())
    act(() => { toast.add({ title: 'One' }); toast.add({ title: 'Two' }) })
    await shown('Two')
    act(() => { toast.close() })
    await waitFor(() => { expect(roots()).toHaveLength(0) })
  })

  it('promise: one toast, the spinner while it waits, then the success text and icon', async () => {
    render(app())
    const held: { settle?: (value: number) => void } = {}
    const waiting = new Promise<number>((resolve) => { held.settle = resolve })
    act(() => { void toast.promise(waiting, { loading: 'Uploading', success: (n) => ({ title: `${String(n)} uploaded` }), error: 'Failed' }) })
    await shown('Uploading')
    expect(roots()[0]?.getAttribute('data-type')).toBe('loading')
    expect(roots()[0]?.querySelector('svg')?.getAttribute('class')).toBe('inline-block shrink-0 animate-spin motion-reduce:animate-none')
    await act(async () => { held.settle?.(3); await waiting })
    expect(await shown('3 uploaded')).toBeTruthy()
    expect(roots()).toHaveLength(1)
    expect(roots()[0]?.getAttribute('data-type')).toBe('success')
  })

  it('promise: the error step replaces the spinner, and the rejection comes back to the caller', async () => {
    render(app())
    const failing = Promise.reject(new Error('offline'))
    let caught: unknown = null
    await act(async () => {
      await toast.promise(failing, { loading: 'Uploading', success: 'Done', error: (e) => ({ title: e instanceof Error ? e.message : '?' }) })
        .catch((error: unknown) => { caught = error })
    })
    expect(await shown('offline')).toBeTruthy()
    expect(roots()[0]?.getAttribute('data-type')).toBe('error')
    expect(caught).toBeInstanceOf(Error)
  })
})

describe('the limit, the x and the list', () => {
  it('hides the fourth toast at the default limit of 3: it stays mounted, marked limited', async () => {
    render(app())
    act(() => { for (const title of ['One', 'Two', 'Three', 'Four']) toast.add({ title }) })
    await shown('Four')
    expect(titles()).toEqual(['Four', 'Three', 'Two', 'One'])
    expect(roots().filter((root) => root.hasAttribute('data-limited')).map((root) => root.querySelector('h2')?.textContent)).toEqual(['One'])
  })

  it('always renders the x, named by the labels and left readable, after the action', async () => {
    render(app())
    act(() => { toast.add({ title: 'Archived', action: { label: 'Undo', onClick: () => undefined } }); toast.add({ title: 'Bare' }) })
    await shown('Bare')
    for (const root of roots()) {
      const buttons = [...root.querySelectorAll('button')]
      const x = buttons.at(-1)
      expect(x?.getAttribute('aria-label')).toBe('Dismiss this notification')
      expect(x?.getAttribute('aria-hidden')).toBe('false')
    }
    expect([...(roots()[1]?.querySelectorAll('button') ?? [])].map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual(['Undo', 'Dismiss this notification'])
  })

  it('a click on the action runs its onClick and leaves the toast open', async () => {
    const onClick = vi.fn()
    render(app())
    act(() => { toast.add({ title: 'Archived', action: { label: 'Undo', onClick } }) })
    await shown('Archived')
    act(() => { screen.getByRole('button', { name: 'Undo' }).click() })
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(titles()).toEqual(['Archived'])
  })

  it('a closed toast leaves Base UI\'s list, because a Root is rendered for it while it ends', async () => {
    render(<TopClassProvider direction="ltr" locale="en"><ListLength /></TopClassProvider>)
    act(() => { toast.add({ title: 'Ending' }) })
    await shown('Ending')
    expect(screen.getByTestId('length').textContent).toBe('1')
    act(() => { toast.close() })
    await waitFor(() => { expect(screen.getByTestId('length').textContent).toBe('0') })
  })

  it('a closed toast is drawn no more, and the next one shows alone', async () => {
    render(app())
    act(() => { toast.add({ title: 'Leaving' }) })
    await shown('Leaving')
    act(() => { screen.getByRole('button', { name: 'Dismiss this notification' }).click() })
    await waitFor(() => { expect(roots()).toHaveLength(0) })
    act(() => { toast.add({ title: 'Next' }) })
    await shown('Next')
    expect(titles()).toEqual(['Next'])
  })

  it('names the region and the x in Arabic under an Arabic provider', async () => {
    render(app('rtl', 'ar'))
    act(() => { toast.add({ title: 'تم' }) })
    await shown('تم')
    const region = screen.getByRole('region', { name: 'الإشعارات' })
    expect(region.getAttribute('dir')).toBe('rtl')
    expect(region.getAttribute('lang')).toBe('ar')
    expect(screen.getByRole('button', { name: 'إغلاق هذا الإشعار' })).toBeTruthy()
  })
})

describe('durations reach Base UI\'s timer', () => {
  it('a duration left out takes the provider\'s, not 5000', async () => {
    vi.useFakeTimers()
    render(<TopClassProvider direction="ltr" locale="en" toast={{ duration: 1200 }} />)
    act(() => { toast.add({ title: 'Timed' }) })
    act(() => { vi.advanceTimersByTime(1199) })
    expect(titles()).toEqual(['Timed'])
    // One more millisecond closes it; the frames of its fade then let Base UI drop it.
    act(() => { vi.advanceTimersByTime(1) })
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(roots()).toHaveLength(0)
  })

  it('a duration of 9000000000 is clamped to ten minutes: still there at 599999, closing at 600000', async () => {
    vi.useFakeTimers()
    render(app())
    act(() => { toast.add({ title: 'Long', duration: 9_000_000_000 }) })
    act(() => { vi.advanceTimersByTime(599_999) })
    expect(titles()).toEqual(['Long'])
    act(() => { vi.advanceTimersByTime(1) })
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(roots()).toHaveLength(0)
  })

  it('a duration of 0 stays', () => {
    vi.useFakeTimers()
    render(app())
    act(() => { toast.add({ title: 'Sticky', duration: 0 }) })
    act(() => { vi.advanceTimersByTime(700_000) })
    expect(titles()).toEqual(['Sticky'])
  })
})
