import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from '../index.js'
import type { DrawerPopupProps } from '../types.js'

/** An open sheet, so the portal, the scrim and the viewport inside it are in the document. */
const sheet = (popup: Partial<DrawerPopupProps> = {}) => (
  <DrawerRoot defaultOpen>
    <DrawerPopup {...popup}>
      <DrawerHeader><DrawerTitle>Publish changes</DrawerTitle></DrawerHeader>
      <DrawerBody>11 files changed.</DrawerBody>
    </DrawerPopup>
  </DrawerRoot>
)

/** The popup, the viewport Base UI centres it in, the scrim beside it, and the container the tree rendered into. */
async function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = await screen.findByRole('dialog')
  return { container, popup, viewport: popup.parentElement, scrim: popup.parentElement?.previousElementSibling }
}

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/drawer.spec.ts.
describe('the viewport carries the direction of its provider, because its portal sits in <body>', () => {
  it('is rtl inside a right-to-left provider', async () => {
    expect((await opened(rtl(sheet()))).viewport?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr inside a left-to-right provider', async () => {
    expect((await opened(ltr(sheet()))).viewport?.getAttribute('dir')).toBe('ltr')
  })

  it('is rtl for an RTL island on a left-to-right page, whose body would hand it ltr', async () => {
    expect((await opened(ltr(rtl(sheet())))).viewport?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr for an LTR island on a right-to-left page, whose body would hand it rtl', async () => {
    expect((await opened(rtl(ltr(sheet())))).viewport?.getAttribute('dir')).toBe('ltr')
  })

  it('really is outside the tree that holds the provider, where no dir of the island reaches it', async () => {
    const { container, viewport } = await opened(rtl(<div dir="rtl">{sheet()}</div>))
    expect(container.contains(viewport ?? null)).toBe(false)
    expect(viewport?.closest('[dir]')).toBe(viewport)
  })

  it('is written once, on the viewport: the popup and everything in it inherit it, and the scrim needs none', async () => {
    const { popup, scrim } = await opened(rtl(sheet()))
    expect(popup.hasAttribute('dir')).toBe(false)
    expect(scrim?.hasAttribute('dir')).toBe(false)
    expect(popup.querySelectorAll('[dir]')).toHaveLength(0)
  })

  it('writes no dir at all with no provider, so the sheet is laid out as its page is', async () => {
    const { viewport, popup } = await opened(sheet())
    expect(viewport?.hasAttribute('dir')).toBe(false)
    expect(popup.closest('[dir]')).toBeNull()
  })

  it('leaves a dir the caller writes on the popup alone, for one sheet in the other script', async () => {
    const { popup, viewport } = await opened(rtl(sheet({ dir: 'ltr' })))
    expect(popup.getAttribute('dir')).toBe('ltr')
    expect(viewport?.getAttribute('dir')).toBe('rtl')
  })
})

// A screen reader picks its voice by lang, and a portal in the body would be read in the language of the page.
describe('the viewport carries the language of its provider as well', () => {
  it('is ar inside an Arabic provider', async () => {
    expect((await opened(rtl(sheet()))).viewport?.getAttribute('lang')).toBe('ar')
  })

  it('is en inside an English one', async () => {
    expect((await opened(ltr(sheet()))).viewport?.getAttribute('lang')).toBe('en')
  })

  it('is the locale as the provider was given it, region and all', async () => {
    const tree = <TopClassProvider direction="rtl" locale="ar-EG">{sheet()}</TopClassProvider>
    expect((await opened(tree)).viewport?.getAttribute('lang')).toBe('ar-EG')
  })

  it('is that of the nearest provider, for an Arabic island on an English page', async () => {
    expect((await opened(ltr(rtl(sheet())))).viewport?.getAttribute('lang')).toBe('ar')
  })

  it('is written once, on the viewport: the popup and the scrim carry none', async () => {
    const { popup, scrim } = await opened(rtl(sheet()))
    expect(popup.hasAttribute('lang')).toBe(false)
    expect(scrim?.hasAttribute('lang')).toBe(false)
  })

  it('is not written at all with no provider, so the language of the page applies', async () => {
    const { viewport, popup } = await opened(sheet())
    expect(viewport?.hasAttribute('lang')).toBe(false)
    expect(popup.closest('[lang]')).toBeNull()
  })

  it('leaves a lang the caller writes on the popup alone, for one sheet in another language', async () => {
    const { popup, viewport } = await opened(rtl(sheet({ lang: 'fr' })))
    expect(popup.getAttribute('lang')).toBe('fr')
    expect(viewport?.getAttribute('lang')).toBe('ar')
  })
})
