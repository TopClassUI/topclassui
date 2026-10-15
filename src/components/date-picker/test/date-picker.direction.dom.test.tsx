import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '../index.js'

/** An open DatePicker with its grid loaded, so the portal and the positioner inside it are in the document. */
const picker = <DatePicker aria-label="Check-in" defaultValue="2026-09-22" defaultOpen />

async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = (await screen.findByRole('grid')).closest('[data-placement]') as HTMLElement
  return { container, popup, positioner: popup.parentElement }
}

/** Intl writes an Arabic short date with a right-to-left mark before each slash, invisible in source, so it is spelt here. */
const marked = (text: string) => text.replaceAll('/', `${String.fromCodePoint(0x200f)}/`)

const rtl = (children: ReactNode, locale = 'ar') => <TopClassProvider direction="rtl" locale={locale}>{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/date-picker.spec.ts.
describe('the positioner carries the direction and the language of its provider, because its portal sits in <body>', () => {
  it('rtl and ar inside a right-to-left Arabic provider; ltr and en inside an English one', async () => {
    const { positioner } = await opened(rtl(picker))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('rtl and ar for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    const { positioner } = await opened(ltr(rtl(picker)))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('written once, on the positioner, outside the tree that holds the provider; neither with no provider', async () => {
    const { container, popup, positioner } = await opened(rtl(<div dir="rtl">{picker}</div>))
    expect(container.contains(positioner)).toBe(false)
    expect(popup.hasAttribute('dir')).toBe(false)
  })

  it('with no provider, no dir and no lang, and the calendar is English', async () => {
    const { positioner } = await opened(picker)
    expect([positioner?.hasAttribute('dir'), positioner?.hasAttribute('lang')]).toEqual([false, false])
    expect(screen.getByRole('heading').textContent).toBe('September 2026')
  })
})

describe('Arabic: month and day names from Intl, digits from the provider', () => {
  it('ar with the provider\'s Latin digits: Arabic names, the week from Saturday, Latin numbers', async () => {
    await opened(rtl(picker))
    expect(screen.getByRole('heading').textContent).toBe('سبتمبر 2026')
    const grid = screen.getByRole('grid')
    expect(within(grid).getAllByRole('columnheader')[0]?.getAttribute('abbr')).toBe('السبت')
    expect(within(grid).getByRole('button', { name: 'الثلاثاء، 22 سبتمبر 2026' }).textContent).toBe('22')
    expect(screen.getByRole('button', { name: 'Check-in' }).textContent).toBe(marked('22/09/2026'))
  })

  it('ar-u-nu-arab with numberingSystem arab: Arabic-Indic digits in the trigger, the title and every day', async () => {
    render(<TopClassProvider direction="rtl" locale="ar-u-nu-arab" numberingSystem="arab">{picker}</TopClassProvider>)
    const grid = await screen.findByRole('grid')
    expect(screen.getByRole('heading').textContent).toBe('سبتمبر ٢٠٢٦')
    expect(within(grid).getByRole('button', { name: 'الثلاثاء، ٢٢ سبتمبر ٢٠٢٦' }).textContent).toBe('٢٢')
    expect(screen.getByRole('button', { name: 'Check-in' }).textContent).toBe(marked('٢٢/٠٩/٢٠٢٦'))
  })

  it('the labels are the provider\'s: the placeholder and the three buttons in Arabic', async () => {
    render(rtl(<DatePicker aria-label="A" />))
    expect(screen.getByRole('button', { name: 'A' }).textContent).toBe('اختر تاريخًا')
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    await screen.findByRole('grid')
    expect(screen.getAllByRole('button').slice(1, 4).map((b) => b.getAttribute('aria-label'))).toEqual(['الشهر السابق', 'الشهر التالي', 'إغلاق'])
  })

  it('the carets are drawn to flip in RTL, so previous points to the inline start in both directions', async () => {
    await opened(rtl(picker))
    const carets = ['الشهر السابق', 'الشهر التالي'].map((name) => screen.getByRole('button', { name }).querySelector('svg')?.getAttribute('class') ?? '')
    for (const caret of carets) expect(caret.split(' ')).toContain('rtl:-scale-x-100')
  })
})
