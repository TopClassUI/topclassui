import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Banner, BannerDismissible } from '../index.js'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

/** Each test takes its own id: the memory fallback lives as long as the module does. */
let next = 0
const fresh = () => `dom-${String(next++)}`

const dismiss = () => screen.getByRole('button', { name: 'Dismiss' })

describe('the x', () => {
  it('is a plain button inside the region, named "Dismiss" with no provider', () => {
    render(<Banner aria-label="Release announcement" dismissible id={fresh()}>Version 2 is out.</Banner>)
    const region = screen.getByRole('region', { name: 'Release announcement' })
    expect(region.lastElementChild).toBe(dismiss())
    expect(dismiss().getAttribute('type')).toBe('button')
  })

  it('is named in Arabic inside an Arabic provider', () => {
    render(
      <TopClassProvider direction="rtl" locale="ar">
        <Banner aria-label="إعلان" dismissible id={fresh()}>صدر الإصدار الثاني.</Banner>
      </TopClassProvider>,
    )
    expect(screen.getByRole('button', { name: 'إغلاق' })).not.toBeNull()
  })

  it('hides its icon from the accessibility tree, so the name is the label alone', () => {
    render(<Banner aria-label="Notice" dismissible id={fresh()}>Out.</Banner>)
    expect(dismiss().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('dismissing', () => {
  it('hides the banner, calls onDismiss once and stores the id', async () => {
    const id = fresh()
    const onDismiss = vi.fn()
    render(<BannerDismissible aria-label="Notice" id={id} onDismiss={onDismiss}>Out.</BannerDismissible>)
    await userEvent.click(dismiss())
    expect(screen.queryByRole('region')).toBeNull()
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(`tc-banner-dismissed:${id}`)).toBe('1')
  })

  it('calls onDismiss while the banner is still in the page, where it can move focus, as the README says', async () => {
    const id = fresh()
    const seen: boolean[] = []
    const onDismiss = () => {
      seen.push(document.getElementById(id) !== null)
      screen.getByRole('button', { name: 'Next' }).focus()
    }
    render(
      <>
        <BannerDismissible aria-label="Notice" id={id} onDismiss={onDismiss}>Out.</BannerDismissible>
        <button type="button">Next</button>
      </>,
    )
    await userEvent.click(dismiss())
    expect(seen).toEqual([true])
    expect(document.getElementById(id)).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  for (const key of ['{Enter}', ' '] as const) {
    it(`works from the keyboard: Tab then ${key === ' ' ? 'Space' : 'Enter'}`, async () => {
      render(<Banner aria-label="Notice" dismissible id={fresh()}>Out.</Banner>)
      await userEvent.tab()
      expect(document.activeElement).toBe(dismiss())
      await userEvent.keyboard(key)
      expect(screen.queryByRole('region')).toBeNull()
    })
  }

  it('leaves a banner with another id where it is', async () => {
    render(
      <>
        <Banner aria-label="First" dismissible id={fresh()}>One.</Banner>
        <Banner aria-label="Second" dismissible id={fresh()}>Two.</Banner>
      </>,
    )
    await userEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0] as HTMLElement)
    expect(screen.queryByRole('region', { name: 'First' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Second' }).textContent).toBe('Two.')
  })

  it('hides every copy of the same id at once', async () => {
    const id = fresh()
    render(
      <>
        <Banner aria-label="Top" dismissible id={id}>One.</Banner>
        <Banner aria-label="Bottom" dismissible id={id}>One.</Banner>
      </>,
    )
    await userEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0] as HTMLElement)
    expect(screen.queryAllByRole('region')).toEqual([])
  })
})

describe('remembering', () => {
  it('renders nothing for an id the storage already holds', () => {
    const id = fresh()
    localStorage.setItem(`tc-banner-dismissed:${id}`, '1')
    render(<Banner aria-label="Notice" dismissible id={id}>Out.</Banner>)
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('still shows a plain banner with that id: only a dismissible one reads the storage', () => {
    const id = fresh()
    localStorage.setItem(`tc-banner-dismissed:${id}`, '1')
    render(<Banner aria-label="Notice" id={id}>Out.</Banner>)
    expect(screen.getByRole('region').textContent).toBe('Out.')
  })

  it('hides when another tab dismisses it, which the storage event reports', () => {
    const id = fresh()
    render(<Banner aria-label="Notice" dismissible id={id}>Out.</Banner>)
    act(() => {
      localStorage.setItem(`tc-banner-dismissed:${id}`, '1')
      window.dispatchEvent(new StorageEvent('storage', { key: `tc-banner-dismissed:${id}` }))
    })
    expect(screen.queryByRole('region')).toBeNull()
  })
})

describe('storage that throws', () => {
  // The getter itself throws, as in a sandboxed frame: a spy on Storage.prototype does not reach happy-dom's storage.
  const own = Object.getOwnPropertyDescriptor(window, 'localStorage')
  const refuse = () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('denied', 'SecurityError') },
    })
  }
  afterEach(() => {
    if (own) Object.defineProperty(window, 'localStorage', own)
    else Reflect.deleteProperty(window, 'localStorage')
  })

  it('the refusal is real: reading the storage throws', () => {
    refuse()
    expect(() => localStorage.getItem('x')).toThrow('denied')
  })

  it('shows the banner, and the x still hides it for the page', async () => {
    refuse()
    const id = fresh()
    const onDismiss = vi.fn()
    const { unmount } = render(<BannerDismissible aria-label="Notice" id={id} onDismiss={onDismiss}>Out.</BannerDismissible>)
    expect(screen.getByRole('region').textContent).toContain('Out.')
    await userEvent.click(dismiss())
    expect(screen.queryByRole('region')).toBeNull()
    expect(onDismiss).toHaveBeenCalledTimes(1)
    unmount()

    // Memory holds it: the same id mounted again on this page stays hidden.
    render(<Banner aria-label="Notice" dismissible id={id}>Out.</Banner>)
    expect(screen.queryByRole('region')).toBeNull()
  })
})

describe('the root', () => {
  it('receives the ref, the rest props and style, as the plain banner does', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Banner ref={ref} aria-label="Notice" dismissible id={fresh()} data-testid="b" style={{ opacity: 0.5 }}>Out.</Banner>)
    expect(ref.current?.getAttribute('role')).toBe('region')
    expect(ref.current?.getAttribute('data-testid')).toBe('b')
    expect(ref.current?.style.opacity).toBe('0.5')
  })

  it('gives the x the hover tint of the banner tone', () => {
    render(<Banner aria-label="Notice" tone="danger" dismissible id={fresh()}>Out.</Banner>)
    expect(dismiss().className.split(' ')).toContain('tone-danger')
    expect(dismiss().className.split(' ')).not.toContain('tone-primary')
  })

  it('a click on the region itself dismisses nothing', () => {
    render(<Banner aria-label="Notice" dismissible id={fresh()}>Out.</Banner>)
    fireEvent.click(screen.getByRole('region'))
    expect(screen.getByRole('region')).not.toBeNull()
  })
})
