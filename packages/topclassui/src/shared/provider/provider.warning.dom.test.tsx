import { render } from '@testing-library/react'
import type { ComponentType } from 'react'
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TopClassProviderProps } from './provider.js'

// A JavaScript layout, or one that read an undefined route param, gets past the types.
type Loose = ComponentType<Omit<TopClassProviderProps, 'direction' | 'locale'> & { direction?: unknown, locale?: unknown }>

/** A fresh module each time, so the once-per-page memory of the last test is gone. */
async function load() {
  vi.resetModules()
  const { TopClassProvider } = await import('./provider.js')
  const { useDirection, useLocale } = await import('./context.js')
  function Probe() {
    return <p data-testid="probe">{`${useDirection()} ${useLocale()}`}</p>
  }
  return { Provider: TopClassProvider as unknown as Loose, Probe }
}

let warn: MockInstance<typeof console.warn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore(); vi.unstubAllEnvs(); document.documentElement.removeAttribute('dir') })

describe('R-13-1: a provider the layout gave no direction or locale', () => {
  it('stays quiet when the layout passes both', async () => {
    const { Provider } = await load()
    render(<Provider direction="rtl" locale="ar"><p>x</p></Provider>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns that the layout must pass direction, and runs on the fallback', async () => {
    const { Provider, Probe } = await load()
    const { getByTestId } = render(<Provider locale="ar"><Probe /></Provider>)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toBe(
      '[topclassui] <TopClassProvider> has no valid direction, so it falls back to direction="ltr".\n'
      + '  Pass both from the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>',
    )
    expect(getByTestId('probe').textContent).toBe('ltr ar')
  })

  it('warns about a missing locale, and the context carries "en" rather than undefined', async () => {
    const { Provider, Probe } = await load()
    const { getByTestId } = render(<Provider direction="rtl"><Probe /></Provider>)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toBe(
      '[topclassui] <TopClassProvider> has no valid locale, so it falls back to locale="en".\n'
      + '  Pass both from the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>',
    )
    expect(getByTestId('probe').textContent).toBe('rtl en')
  })

  it('names both in one warning, and treats a direction outside ltr and rtl and an empty locale as missing', async () => {
    const { Provider, Probe } = await load()
    const { getByTestId } = render(<Provider direction="auto" locale=""><Probe /></Provider>)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('has no valid direction or locale, so it falls back to direction="ltr" locale="en".')
    expect(getByTestId('probe').textContent).toBe('ltr en')
  })

  it('warns once per page, however many providers mount or re-render without the props', async () => {
    const { Provider } = await load()
    const { rerender } = render(<Provider><Provider><p>x</p></Provider></Provider>)
    rerender(<Provider className="a"><Provider><p>y</p></Provider></Provider>)
    render(<Provider><p>z</p></Provider>)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('still warns about locale after it already warned about direction alone', async () => {
    const { Provider } = await load()
    render(<Provider locale="en"><p>x</p></Provider>)
    render(<Provider direction="ltr"><p>y</p></Provider>)
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[1]?.[0]).toContain('has no valid locale,')
  })

  it('never warns in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { Provider, Probe } = await load()
    const { getByTestId } = render(<Provider><Probe /></Provider>)
    expect(warn).not.toHaveBeenCalled()
    expect(getByTestId('probe').textContent).toBe('ltr en')
  })
})

describe('R-13-1: a provider whose direction disagrees with <html dir>', () => {
  it('warns once, naming both, when the outermost provider disagrees with the page', async () => {
    document.documentElement.dir = 'rtl'
    const { Provider } = await load()
    render(<Provider direction="ltr" locale="en"><p>x</p></Provider>)
    render(<Provider direction="ltr" locale="en"><p>y</p></Provider>)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toBe(
      '[topclassui] <TopClassProvider direction="ltr"> disagrees with <html dir="rtl">.\n'
      + '  Pass the same direction to both from the root layout (R-13-1).',
    )
  })

  it('stays quiet when they agree, when the page sets no dir, and for a nested island', async () => {
    const { Provider } = await load()
    render(<Provider direction="ltr" locale="en"><p>x</p></Provider>)
    document.documentElement.dir = 'ltr'
    render(<Provider direction="ltr" locale="en"><Provider direction="rtl" locale="ar"><p>y</p></Provider></Provider>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('never warns in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    document.documentElement.dir = 'rtl'
    const { Provider } = await load()
    render(<Provider direction="ltr" locale="en"><p>x</p></Provider>)
    expect(warn).not.toHaveBeenCalled()
  })
})
