import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '../index.js'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]

/** An open Select, so the portal and the positioner inside it are in the document. */
const select = <Select aria-label="Country" items={ITEMS} defaultOpen />

/** The popup, the positioner Base UI places around it, and the container the tree itself rendered into. */
async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = (await screen.findByRole('listbox')).closest('[data-placement]') as HTMLElement
  return { container, popup, positioner: popup.parentElement }
}

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/select.spec.ts.
describe('the positioner carries the direction and the language of its provider, because its portal sits in <body>', () => {
  it('rtl and ar inside a right-to-left Arabic provider', async () => {
    const { positioner } = await opened(rtl(select))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('ltr and en inside an English one', async () => {
    const { positioner } = await opened(ltr(select))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['ltr', 'en'])
  })

  it('rtl and ar for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    const { positioner } = await opened(ltr(rtl(select)))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('ltr for an LTR island on a right-to-left page', async () => {
    expect((await opened(rtl(ltr(select)))).positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('really is outside the tree that holds the provider, and written once, on the positioner', async () => {
    const { container, popup, positioner } = await opened(rtl(<div dir="rtl">{select}</div>))
    expect(container.contains(positioner)).toBe(false)
    expect(positioner?.closest('[dir]')).toBe(positioner)
    expect(popup.hasAttribute('dir')).toBe(false)
    expect(popup.hasAttribute('lang')).toBe(false)
  })

  it('writes neither with no provider, so the portal inherits the page\'s', async () => {
    const { positioner } = await opened(select)
    expect(positioner?.hasAttribute('dir')).toBe(false)
    expect(positioner?.hasAttribute('lang')).toBe(false)
  })

  it('the placeholder comes from the provider\'s labels, and English with none', () => {
    render(<>{rtl(<Select aria-label="A" items={ITEMS} />)}<Select aria-label="B" items={ITEMS} /></>)
    expect(screen.getAllByRole('combobox').map((one) => one.textContent)).toEqual(['اختر', 'Select'])
  })
})
