import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipPopupProps } from '../types.js'

/** An open tooltip, so the portal and the positioner inside it are in the document. */
const tooltip = (popup: Partial<TooltipPopupProps> = {}) => (
  <TooltipRoot defaultOpen>
    <TooltipTrigger render={<Button aria-label="Copy link" />} />
    <TooltipPopup {...popup}>Copy link</TooltipPopup>
  </TooltipRoot>
)

/** The popup, the positioner Base UI places around it, and the container the tree itself rendered into. */
function opened(tree: ReactNode) {
  const { container } = render(tree)
  const popup = screen.getByText('Copy link', { selector: '[data-placement]' })
  return { container, popup, positioner: popup.parentElement, arrow: popup.lastElementChild }
}

// happy-dom computes no direction from dir, so the attribute is read here and its effect in e2e/tooltip.spec.ts.
describe('the positioner carries the direction of its provider, because its portal sits in <body>', () => {
  it('is rtl inside a right-to-left provider', () => {
    const { positioner } = opened(<TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>)
    expect(positioner?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr inside a left-to-right provider', () => {
    const { positioner } = opened(<TopClassProvider direction="ltr" locale="en">{tooltip()}</TopClassProvider>)
    expect(positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('is rtl for an RTL island on a left-to-right page, whose body would hand it ltr', () => {
    const { positioner } = opened(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>
      </TopClassProvider>,
    )
    expect(positioner?.getAttribute('dir')).toBe('rtl')
  })

  it('is ltr for an LTR island on a right-to-left page, whose body would hand it rtl', () => {
    const { positioner } = opened(
      <TopClassProvider direction="rtl" locale="ar">
        <TopClassProvider direction="ltr" locale="en">{tooltip()}</TopClassProvider>
      </TopClassProvider>,
    )
    expect(positioner?.getAttribute('dir')).toBe('ltr')
  })

  it('really is outside the tree that holds the provider, where no dir of the island reaches it', () => {
    const { container, positioner } = opened(
      <TopClassProvider direction="rtl" locale="ar"><div dir="rtl">{tooltip()}</div></TopClassProvider>,
    )
    expect(container.contains(positioner)).toBe(false)
    expect(positioner?.closest('[dir]')).toBe(positioner)
  })

  it('is written once, on the positioner: the popup and the arrow inherit it', () => {
    const { popup, arrow } = opened(<TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>)
    expect(popup.hasAttribute('dir')).toBe(false)
    expect(arrow?.hasAttribute('dir')).toBe(false)
  })

  it('writes no dir with no provider, so the portal inherits the direction of the page', () => {
    expect(opened(tooltip()).positioner?.hasAttribute('dir')).toBe(false)
  })

  it('leaves a dir the caller writes on the popup alone, for one tooltip in the other script', () => {
    const { popup, positioner } = opened(
      <TopClassProvider direction="rtl" locale="ar">{tooltip({ dir: 'ltr' })}</TopClassProvider>,
    )
    expect(popup.getAttribute('dir')).toBe('ltr')
    expect(positioner?.getAttribute('dir')).toBe('rtl')
  })
})

// A screen reader picks its voice from lang, and the browser its glyph shapes: a portal loses both with dir.
describe('the positioner carries the language of its provider as well', () => {
  it('is ar inside an Arabic provider', () => {
    const { positioner } = opened(<TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>)
    expect(positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is en inside an English provider', () => {
    const { positioner } = opened(<TopClassProvider direction="ltr" locale="en">{tooltip()}</TopClassProvider>)
    expect(positioner?.getAttribute('lang')).toBe('en')
  })

  it('is the whole tag the provider was given, region and numbering system included', () => {
    const { positioner } = opened(<TopClassProvider direction="rtl" locale="ar-EG-u-nu-arab">{tooltip()}</TopClassProvider>)
    expect(positioner?.getAttribute('lang')).toBe('ar-EG-u-nu-arab')
  })

  it('is ar for an Arabic island on an English page, whose body would hand it en', () => {
    const { positioner } = opened(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>
      </TopClassProvider>,
    )
    expect(positioner?.getAttribute('lang')).toBe('ar')
  })

  it('is en for an English island on an Arabic page, whose body would hand it ar', () => {
    const { positioner } = opened(
      <TopClassProvider direction="rtl" locale="ar">
        <TopClassProvider direction="ltr" locale="en">{tooltip()}</TopClassProvider>
      </TopClassProvider>,
    )
    expect(positioner?.getAttribute('lang')).toBe('en')
  })

  it('is written once, on the positioner: the popup and the arrow inherit it', () => {
    const { popup, arrow } = opened(<TopClassProvider direction="rtl" locale="ar">{tooltip()}</TopClassProvider>)
    expect(popup.hasAttribute('lang')).toBe(false)
    expect(arrow?.hasAttribute('lang')).toBe(false)
  })

  it('writes no lang with no provider, so an Arabic page is not announced as English', () => {
    expect(opened(tooltip()).positioner?.hasAttribute('lang')).toBe(false)
  })

  it('leaves a lang the caller writes on the popup alone, for one tooltip in another language', () => {
    const { popup, positioner } = opened(
      <TopClassProvider direction="rtl" locale="ar">{tooltip({ lang: 'fr' })}</TopClassProvider>,
    )
    expect(popup.getAttribute('lang')).toBe('fr')
    expect(positioner?.getAttribute('lang')).toBe('ar')
  })
})
