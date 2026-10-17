import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '../index.js'

const ITEMS = [{ value: 'next', label: 'Next.js' }, { value: 'astro', label: 'Astro' }]

/** An open Combobox, so the portal and the positioner inside it are in the document. */
const combobox = <Combobox aria-label="Framework" items={ITEMS} defaultOpen />

/** The popup, the positioner Base UI places around it, and the container the tree itself rendered into. */
async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = (await screen.findByRole('listbox')).closest('[data-placement]') as HTMLElement
  return { container, popup, positioner: popup.parentElement }
}

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/combobox.spec.ts.
describe('the positioner carries the direction and the language of its provider, because its portal sits in <body>', () => {
  it('rtl and ar inside a right-to-left Arabic provider', async () => {
    const { positioner } = await opened(rtl(combobox))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('ltr and en inside an English one', async () => {
    const { positioner } = await opened(ltr(combobox))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['ltr', 'en'])
  })

  it('rtl and ar for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    const { positioner } = await opened(ltr(rtl(combobox)))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('really is outside the tree that holds the provider, and written once, on the positioner', async () => {
    const { container, popup, positioner } = await opened(rtl(<div dir="rtl">{combobox}</div>))
    expect(container.contains(positioner)).toBe(false)
    expect(positioner?.closest('[dir]')).toBe(positioner)
    expect(popup.hasAttribute('dir')).toBe(false)
  })

  it('writes neither with no provider, so the portal inherits the page\'s', async () => {
    const { positioner } = await opened(combobox)
    expect(positioner?.hasAttribute('dir')).toBe(false)
    expect(positioner?.hasAttribute('lang')).toBe(false)
  })

  it('an empty list says the label of the provider\'s language', async () => {
    render(rtl(<Combobox aria-label="A" items={[]} defaultOpen />))
    const [status] = await screen.findAllByRole('status')
    expect(status?.textContent.replace('⁠', '')).toBe('لا نتائج')
  })
})
