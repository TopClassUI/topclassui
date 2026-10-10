import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from './provider.js'
import { usePortalLocale } from './use-portal-locale.js'

/** What a portaled part does with it: both values straight onto the element it positions. */
function Positioned() {
  const locale = usePortalLocale()
  return <div data-testid="positioned" dir={locale.dir} lang={locale.lang} data-keys={Object.keys(locale).join(' ')} />
}

const positioned = () => screen.getByTestId('positioned')

describe('inside a provider a portaled part carries its direction and its language', () => {
  it('rtl and ar from an Arabic provider', () => {
    render(<TopClassProvider direction="rtl" locale="ar"><Positioned /></TopClassProvider>)
    expect(positioned().getAttribute('dir')).toBe('rtl')
    expect(positioned().getAttribute('lang')).toBe('ar')
  })

  it('ltr and en from an English provider', () => {
    render(<TopClassProvider direction="ltr" locale="en"><Positioned /></TopClassProvider>)
    expect(positioned().getAttribute('dir')).toBe('ltr')
    expect(positioned().getAttribute('lang')).toBe('en')
  })

  it('the island, not the page around it, when providers are nested', () => {
    render(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar-EG"><Positioned /></TopClassProvider>
      </TopClassProvider>,
    )
    expect(positioned().getAttribute('dir')).toBe('rtl')
    expect(positioned().getAttribute('lang')).toBe('ar-EG')
  })

  it('and nothing else: the two attributes are all it returns', () => {
    render(<TopClassProvider direction="rtl" locale="ar"><Positioned /></TopClassProvider>)
    expect(positioned().getAttribute('data-keys')).toBe('dir lang')
  })
})

// R-13-1 asks for the provider, so this is how the part fails: softly, by leaving the page in charge.
describe('with no provider it writes neither, so the portal inherits both from the page', () => {
  it('no dir attribute: not the ltr the other hooks fall back to', () => {
    render(<Positioned />)
    expect(positioned().hasAttribute('dir')).toBe(false)
  })

  it('no lang attribute: not the en the built-in labels are in', () => {
    render(<Positioned />)
    expect(positioned().hasAttribute('lang')).toBe(false)
  })

  it('still returns both keys, each undefined, so a part can read them without a guard', () => {
    render(<Positioned />)
    expect(positioned().getAttribute('data-keys')).toBe('dir lang')
  })
})
