import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  useCollectionDefaults,
  useDirection,
  useLabels,
  useLocale,
  useNumberFormat,
} from './context.js'
import { TopClassProvider } from './provider.js'

function Probe() {
  const labels = useLabels()
  const fmt = useNumberFormat()
  return (
    <ul>
      <li data-testid="direction">{useDirection()}</li>
      <li data-testid="locale">{useLocale()}</li>
      <li data-testid="close">{labels.common.close}</li>
      <li data-testid="results">{labels.collection.results(3, fmt)}</li>
      <li data-testid="rows">{useCollectionDefaults().visibleRows}</li>
    </ul>
  )
}

const text = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`)?.textContent

describe('without a provider', () => {
  it('a client component still works on the English defaults', () => {
    const { container } = render(<Probe />)
    expect(text(container, 'direction')).toBe('ltr')
    expect(text(container, 'close')).toBe('Close')
    expect(text(container, 'rows')).toBe('7')
  })
})

describe('TopClassProvider', () => {
  it('provides the direction and locale it is given', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar"><Probe /></TopClassProvider>,
    )
    expect(text(container, 'direction')).toBe('rtl')
    expect(text(container, 'locale')).toBe('ar')
    expect(text(container, 'close')).toBe('إغلاق')
  })

  it('uses the Arabic plural form, not a template', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar"><Probe /></TopClassProvider>,
    )
    expect(text(container, 'results')).toBe('3 نتائج')
  })

  it('prints Arabic-Indic digits when asked', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar" numberingSystem="arab"><Probe /></TopClassProvider>,
    )
    expect(text(container, 'results')).toBe('٣ نتائج')
  })

  it('applies a label override and keeps the rest of the group', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar" labels={{ common: { close: 'اغلق' } }}>
        <Probe />
      </TopClassProvider>,
    )
    expect(text(container, 'close')).toBe('اغلق')
    expect(text(container, 'results')).toBe('3 نتائج')
  })

  it('merges collection defaults rather than replacing them', () => {
    const { container } = render(
      <TopClassProvider direction="ltr" locale="en" collection={{ visibleRows: 12 }}>
        <Probe />
      </TopClassProvider>,
    )
    expect(text(container, 'rows')).toBe('12')
  })

  it('renders the Base UI direction provider, so arrow keys and placement mirror', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar"><span>x</span></TopClassProvider>,
    )
    expect(container.textContent).toBe('x')
  })

  it('wraps children in an isolation root', () => {
    const { container } = render(
      <TopClassProvider direction="ltr" locale="en"><span>x</span></TopClassProvider>,
    )
    expect(container.querySelector('.isolate')).not.toBeNull()
  })
})
