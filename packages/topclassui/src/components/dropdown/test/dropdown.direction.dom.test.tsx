import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownMenu, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownPopupProps } from '../types.js'

/** An open menu, so the portal and the positioner inside it are in the document. */
const dropdown = (popup: DropdownPopupProps = {}) => (
  <DropdownRoot defaultOpen>
    <DropdownTrigger render={<Button>Actions</Button>} />
    <DropdownPopup {...popup}><DropdownItem>Rename</DropdownItem></DropdownPopup>
  </DropdownRoot>
)

/** The menu, the positioner Base UI places around it, and the container the tree itself rendered into. */
async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = await screen.findByRole('menu')
  return { container, popup, positioner: popup.parentElement }
}

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/dropdown.spec.ts.
describe('the positioner carries the direction of its provider, because its portal sits in <body>', () => {
  it('is rtl inside a right-to-left provider, and ltr inside a left-to-right one', async () => {
    const first = await opened(rtl(dropdown()))
    expect(first.positioner?.getAttribute('dir')).toBe('rtl')
    first.container.remove()
  })

  it('is ltr inside a left-to-right provider', async () => {
    expect((await opened(ltr(dropdown()))).positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('is rtl for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    expect((await opened(ltr(rtl(dropdown())))).positioner?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr for an LTR island on a right-to-left page, whose body would hand it rtl', async () => {
    expect((await opened(rtl(ltr(dropdown())))).positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('really is outside the tree that holds the provider, where no dir of the island reaches it', async () => {
    const { container, positioner } = await opened(rtl(<div dir="rtl">{dropdown()}</div>))
    expect(container.contains(positioner)).toBe(false)
    expect(positioner?.closest('[dir]')).toBe(positioner)
  })

  // Floating UI reads the direction of the element it positions: on the menu alone, start and end would not mirror.
  it('is written once, on the positioner and not on the menu, which inherits it', async () => {
    const { popup, positioner } = await opened(rtl(dropdown()))
    expect(popup.hasAttribute('dir')).toBe(false)
    expect(positioner?.getAttribute('role')).toBe('presentation')
  })

  it('writes no dir with no provider, so the portal inherits the direction of the page', async () => {
    expect((await opened(dropdown())).positioner?.hasAttribute('dir')).toBe(false)
  })

  it('leaves a dir the caller writes on the menu alone, for one menu in the other script', async () => {
    const { popup, positioner } = await opened(rtl(dropdown({ dir: 'ltr' })))
    expect(popup.getAttribute('dir')).toBe('ltr')
    expect(positioner?.getAttribute('dir')).toBe('rtl')
  })
})

// A screen reader picks its voice from lang, and the browser its glyph shapes: a portal loses both with dir.
describe('the positioner carries the language of its provider as well', () => {
  it('is ar inside an Arabic provider, and en inside an English one', async () => {
    expect((await opened(rtl(dropdown()))).positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is en inside an English provider', async () => {
    expect((await opened(ltr(dropdown()))).positioner?.getAttribute('lang')).toBe('en')
  })

  it('is the whole tag the provider was given, region and numbering system included', async () => {
    const tree = <TopClassProvider direction="rtl" locale="ar-EG-u-nu-arab">{dropdown()}</TopClassProvider>
    expect((await opened(tree)).positioner?.getAttribute('lang')).toBe('ar-EG-u-nu-arab')
  })

  it('is ar for an Arabic island on an English page, whose body would hand it en', async () => {
    expect((await opened(ltr(rtl(dropdown())))).positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is written once, on the positioner: the menu inherits it', async () => {
    expect((await opened(rtl(dropdown()))).popup.hasAttribute('lang')).toBe(false)
  })

  it('writes no lang with no provider, so an Arabic page is not announced as English', async () => {
    expect((await opened(dropdown())).positioner?.hasAttribute('lang')).toBe(false)
  })
})

describe('the data-driven menu is positioned by the same part', () => {
  it('its positioner carries the direction and the language of the provider too', async () => {
    const { positioner } = await opened(rtl(
      <DropdownMenu defaultOpen trigger={<Button>Account</Button>} title="Account" items={[{ id: 'p', label: 'Profile', href: '/p' }]} />,
    ))
    expect([positioner?.getAttribute('dir'), positioner?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })
})
