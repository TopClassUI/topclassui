import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from '../index.js'

/** An open sheet with a bare DrawerClose in its footer, and the x every sheet ends with. */
const sheet = (
  <DrawerRoot defaultOpen>
    <DrawerPopup>
      <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
      <DrawerFooter><DrawerClose /></DrawerFooter>
    </DrawerPopup>
  </DrawerRoot>
)

/** The accessible name of every button in the open popup, in document order. */
async function names(tree: ReactNode) {
  render(tree)
  const popup = await screen.findByRole('dialog')
  return [...popup.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))
}

describe('the name of the x comes from labels (R-5.11-1)', () => {
  it('is English with no provider, the fallback every client part has', async () => {
    expect(await names(sheet)).toEqual(['Close this panel', 'Close this panel'])
  })

  it('is English under an English provider', async () => {
    expect(await names(<TopClassProvider direction="ltr" locale="en">{sheet}</TopClassProvider>))
      .toEqual(['Close this panel', 'Close this panel'])
  })

  it('is Arabic under an Arabic provider', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar">{sheet}</TopClassProvider>))
      .toEqual(['إغلاق هذه اللوحة', 'إغلاق هذه اللوحة'])
  })

  it('is Arabic for a regional Arabic locale too, since the language decides', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar-EG">{sheet}</TopClassProvider>))
      .toEqual(['إغلاق هذه اللوحة', 'إغلاق هذه اللوحة'])
  })

  it('follows the nearest provider, so an Arabic island on an English page names its x in Arabic', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar">{sheet}</TopClassProvider>
      </TopClassProvider>,
    )).toEqual(['إغلاق هذه اللوحة', 'إغلاق هذه اللوحة'])
  })

  it('follows an app that changes that one string, and leaves the rest of the labels alone', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en" labels={{ drawer: { close: 'Close the filters' } }}>{sheet}</TopClassProvider>,
    )).toEqual(['Close the filters', 'Close the filters'])
  })

  it('is untouched by an app that renames the x of a Dialog: the two have a label each', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en" labels={{ dialog: { close: 'Close the window' } }}>{sheet}</TopClassProvider>,
    )).toEqual(['Close this panel', 'Close this panel'])
  })

  it('reads drawer.close, not dialog.close and not the shorter common.close, in both languages', () => {
    expect(en.drawer.close).toBe('Close this panel')
    expect(en.dialog.close).toBe('Close this dialog')
    expect(en.common.close).toBe('Close')
    expect(ar.drawer.close).toBe('إغلاق هذه اللوحة')
    expect(ar.common.close).toBe('إغلاق')
  })

  it('writes no English into the markup of an Arabic sheet', async () => {
    render(<TopClassProvider direction="rtl" locale="ar">{sheet}</TopClassProvider>)
    const popup = await screen.findByRole('dialog')
    expect(popup.outerHTML).not.toContain('Close')
    expect(popup.outerHTML).not.toMatch(/labels=|\[object/)
  })
})
