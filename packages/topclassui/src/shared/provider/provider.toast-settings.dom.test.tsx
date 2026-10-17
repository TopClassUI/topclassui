import { render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { useToastSettings } from './context.js'
import { TopClassProvider, type TopClassProviderProps } from './provider.js'

function Settings() {
  return <output data-testid="settings">{JSON.stringify(useToastSettings())}</output>
}

const settings = () => JSON.parse(screen.getByTestId('settings').textContent) as unknown

const provider = (toast?: TopClassProviderProps['toast'], children = <Settings />) => (
  <TopClassProvider direction="ltr" locale="en" toast={toast}>{children}</TopClassProvider>
)

describe('useToastSettings', () => {
  it('returns the defaults with no provider, so a client part still renders', () => {
    render(<Settings />)
    expect(settings()).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('returns the defaults inside a provider that was given no toast prop', () => {
    render(provider())
    expect(settings()).toEqual({ placement: 'bottom-end', limit: 3, duration: 5000 })
  })

  it('keeps the other defaults when the prop names one key', () => {
    render(provider({ placement: 'top-start' }))
    expect(settings()).toEqual({ placement: 'top-start', limit: 3, duration: 5000 })
  })

  it('clamps limit and duration at the low end: one toast, and 0, which never closes', () => {
    render(provider({ limit: 0, duration: -5 }))
    expect(settings()).toEqual({ placement: 'bottom-end', limit: 1, duration: 0 })
  })

  it('clamps limit and duration at the high end: ten toasts and ten minutes', () => {
    render(provider({ limit: 99, duration: 9_000_000_000 }))
    expect(settings()).toEqual({ placement: 'bottom-end', limit: 10, duration: 600000 })
  })

  it('follows the prop when it changes after mount', () => {
    const view = render(provider({ limit: 2 }))
    view.rerender(provider({ limit: 4, placement: 'top' }))
    expect(settings()).toEqual({ placement: 'top', limit: 4, duration: 5000 })
  })

  it('hands every reader the same object while the three values stay the same, though the prop is a new object', () => {
    const seen: unknown[] = []
    function Probe() { seen.push(useToastSettings()); return null }
    const view = render(provider({ limit: 2 }, <Probe />))
    view.rerender(provider({ limit: 2 }, <Probe />))
    expect(seen).toHaveLength(2)
    expect(seen[1]).toBe(seen[0])
  })
})

describe('a nested provider, such as an RTL island', () => {
  it('returns the outer settings, the ones the one viewport is placed by, whatever its own prop says', () => {
    render(
      <TopClassProvider direction="ltr" locale="en" toast={{ limit: 1, placement: 'top' }}>
        <TopClassProvider direction="rtl" locale="ar" toast={{ limit: 5, placement: 'bottom-start', duration: 100 }}>
          <Settings />
        </TopClassProvider>
      </TopClassProvider>,
    )
    expect(settings()).toEqual({ placement: 'top', limit: 1, duration: 5000 })
  })
})

describe('the toast prop crosses from a Server Component (R-5.1-3)', () => {
  type Given = NonNullable<TopClassProviderProps['toast']>

  it('is optional, and each key of it is', () => {
    expectTypeOf<TopClassProviderProps['toast']>().toEqualTypeOf<Given | undefined>()
    expectTypeOf<Given>().toEqualTypeOf<{
      placement?: 'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end' | undefined
      limit?: number | undefined
      duration?: number | undefined
    }>()
  })

  it('holds strings and numbers only: no function, no element, no class instance', () => {
    expectTypeOf<Given[keyof Given]>().toEqualTypeOf<
      'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end' | number | undefined
    >()
  })

  it('means the same after a trip through JSON, which a plain object survives whole', () => {
    const given: Given = { placement: 'top-end', limit: 4, duration: 2500 }
    const crossed = JSON.parse(JSON.stringify(given)) as Given
    expect(crossed).toEqual({ placement: 'top-end', limit: 4, duration: 2500 })
    render(provider(crossed))
    expect(settings()).toEqual({ placement: 'top-end', limit: 4, duration: 2500 })
  })
})
