import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverPopupProps } from '../types.js'

/** An open popover, so the portal and the positioner inside it are in the document. */
const popover = (popup: PopoverPopupProps = {}) => (
  <PopoverRoot defaultOpen>
    <PopoverTrigger render={<Button>Share</Button>} />
    <PopoverPopup {...popup}><PopoverTitle>Share this page</PopoverTitle></PopoverPopup>
  </PopoverRoot>
)

/** The popup, the positioner Base UI places around it, and the container the tree itself rendered into. */
async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = await screen.findByRole('dialog')
  return { container, popup, positioner: popup.parentElement }
}

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/popover.spec.ts.
describe('the positioner carries the direction of its provider, because its portal sits in <body>', () => {
  it('is rtl inside a right-to-left provider', async () => {
    expect((await opened(rtl(popover()))).positioner?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr inside a left-to-right provider', async () => {
    expect((await opened(ltr(popover()))).positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('is rtl for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    expect((await opened(ltr(rtl(popover())))).positioner?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr for an LTR island on a right-to-left page, whose body would hand it rtl', async () => {
    expect((await opened(rtl(ltr(popover())))).positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('really is outside the tree that holds the provider, where no dir of the island reaches it', async () => {
    const { container, positioner } = await opened(rtl(<div dir="rtl">{popover()}</div>))
    expect(container.contains(positioner)).toBe(false)
    expect(positioner?.closest('[dir]')).toBe(positioner)
  })

  // Floating UI reads the direction of the element it positions: on the popup alone, start and end would not mirror.
  it('is written once, on the positioner and not on the popup, which inherits it', async () => {
    const { popup, positioner } = await opened(rtl(popover()))
    expect(popup.hasAttribute('dir')).toBe(false)
    expect(positioner?.getAttribute('role')).toBe('presentation')
  })

  it('writes no dir with no provider, so the portal inherits the direction of the page', async () => {
    expect((await opened(popover())).positioner?.hasAttribute('dir')).toBe(false)
  })

  it('leaves a dir the caller writes on the popup alone, for one popover in the other script', async () => {
    const { popup, positioner } = await opened(rtl(popover({ dir: 'ltr' })))
    expect(popup.getAttribute('dir')).toBe('ltr')
    expect(positioner?.getAttribute('dir')).toBe('rtl')
  })
})

// A screen reader picks its voice from lang, and the browser its glyph shapes: a portal loses both with dir.
describe('the positioner carries the language of its provider as well', () => {
  it('is ar inside an Arabic provider', async () => {
    expect((await opened(rtl(popover()))).positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is en inside an English provider', async () => {
    expect((await opened(ltr(popover()))).positioner?.getAttribute('lang')).toBe('en')
  })

  it('is the whole tag the provider was given, region and numbering system included', async () => {
    const tree = <TopClassProvider direction="rtl" locale="ar-EG-u-nu-arab">{popover()}</TopClassProvider>
    expect((await opened(tree)).positioner?.getAttribute('lang')).toBe('ar-EG-u-nu-arab')
  })

  it('is ar for an Arabic island on an English page, whose body would hand it en', async () => {
    expect((await opened(ltr(rtl(popover())))).positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is written once, on the positioner: the popup inherits it', async () => {
    expect((await opened(rtl(popover()))).popup.hasAttribute('lang')).toBe(false)
  })

  it('writes no lang with no provider, so an Arabic page is not announced as English', async () => {
    expect((await opened(popover())).positioner?.hasAttribute('lang')).toBe(false)
  })

  it('leaves a lang the caller writes on the popup alone, for one popover in another language', async () => {
    const { popup, positioner } = await opened(rtl(popover({ lang: 'fr' })))
    expect(popup.getAttribute('lang')).toBe('fr')
    expect(positioner?.getAttribute('lang')).toBe('ar')
  })
})
