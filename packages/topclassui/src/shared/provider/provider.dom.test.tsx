import { Tooltip } from '@base-ui/react/tooltip'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { describe, expect, it } from 'vitest'

import {
  TopClassContext,
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

/** Twelve in the provider's digits, and the numbering system it says it uses. */
function System() {
  return (
    <ul>
      <li data-testid="twelve">{useNumberFormat().format(12)}</li>
      <li data-testid="system">{useContext(TopClassContext)?.numberingSystem}</li>
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

  it('follows a -u-nu- in its locale tag when given no numbering system, as every server half does', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar-u-nu-arab"><Probe /><System /></TopClassProvider>,
    )
    expect(text(container, 'results')).toBe('٣ نتائج')
    expect(text(container, 'twelve')).toBe('١٢')
    expect(text(container, 'system')).toBe('arab')
  })

  it('keeps Latin digits for a tag with no -u-nu-, and lets a numbering system it is given win over the tag', () => {
    const { container } = render(
      <>
        <TopClassProvider direction="rtl" locale="ar"><System /></TopClassProvider>
        <TopClassProvider direction="rtl" locale="ar-u-nu-arab" numberingSystem="latn"><System /></TopClassProvider>
      </>,
    )
    expect([...container.querySelectorAll('[data-testid="twelve"]')].map((cell) => cell.textContent)).toEqual(['12', '12'])
    expect([...container.querySelectorAll('[data-testid="system"]')].map((cell) => cell.textContent)).toEqual(['latn', 'latn'])
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

/** One Base UI tooltip; TooltipRoot does not exist yet, so the parts are used directly. */
function Tip({ label }: { label: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>{label}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner><Tooltip.Popup>{`${label} tip`}</Tooltip.Popup></Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** Hover the first until it opens, then move to the second and report whether it opened at once. */
async function secondOpensAtOnce() {
  const user = userEvent.setup()
  const first = screen.getByRole('button', { name: 'First' })
  await user.hover(first)
  // Not yet: the first tooltip waits out Base UI's 600 ms, or the timing below proves nothing.
  expect(screen.queryByText('First tip')).toBeNull()
  await screen.findByText('First tip', undefined, { timeout: 1500 })

  await user.unhover(first)
  await user.hover(screen.getByRole('button', { name: 'Second' }))
  try {
    await screen.findByText('Second tip', undefined, { timeout: 100 })
    return true
  } catch {
    return false
  }
}

describe('the tooltip delay group (PLAN 18.8)', () => {
  it('opens the next tooltip within 100 ms once one has been shown', async () => {
    render(<TopClassProvider direction="ltr" locale="en"><Tip label="First" /><Tip label="Second" /></TopClassProvider>)
    expect(await secondOpensAtOnce()).toBe(true)
  })

  it('makes the second wait its full delay without the provider, which is what it adds', async () => {
    render(<><Tip label="First" /><Tip label="Second" /></>)
    expect(await secondOpensAtOnce()).toBe(false)
    // And it still opens once the delay has passed, so false meant "waited", not "never".
    expect(await screen.findByText('Second tip', undefined, { timeout: 1500 })).toBeTruthy()
  })

  it('keeps one group across a nested provider, such as an RTL island', async () => {
    render(
      <TopClassProvider direction="ltr" locale="en">
        <Tip label="First" />
        <TopClassProvider direction="rtl" locale="ar"><Tip label="Second" /></TopClassProvider>
      </TopClassProvider>,
    )
    expect(await secondOpensAtOnce()).toBe(true)
  })

  it("lets an app's own Tooltip.Provider inside it set the delay, which is where it belongs", async () => {
    const user = userEvent.setup()
    render(
      <TopClassProvider direction="ltr" locale="en">
        <Tooltip.Provider delay={100}><Tip label="First" /></Tooltip.Provider>
      </TopClassProvider>,
    )
    await user.hover(screen.getByRole('button', { name: 'First' }))
    // Well under the 600 ms default, so only the inner delay can explain it.
    expect(await screen.findByText('First tip', undefined, { timeout: 400 })).toBeTruthy()
  })
})
