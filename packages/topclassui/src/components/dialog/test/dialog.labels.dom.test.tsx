import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle } from '../index.js'

/** An open dialog with the built-in x in its header and a bare DialogClose in its footer. */
const dialog = (
  <DialogRoot defaultOpen>
    <DialogPopup>
      <DialogHeader><DialogTitle>Publish changes</DialogTitle></DialogHeader>
      <DialogFooter><DialogClose /></DialogFooter>
    </DialogPopup>
  </DialogRoot>
)

/** The accessible name of every button in the open popup, in document order. */
async function names(tree: ReactNode) {
  render(tree)
  const popup = await screen.findByRole('dialog')
  return [...popup.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))
}

describe('the name of the x comes from labels (R-5.11-1)', () => {
  it('is English with no provider, the fallback every client part has', async () => {
    expect(await names(dialog)).toEqual(['Close this dialog', 'Close this dialog'])
  })

  it('is English under an English provider', async () => {
    expect(await names(<TopClassProvider direction="ltr" locale="en">{dialog}</TopClassProvider>))
      .toEqual(['Close this dialog', 'Close this dialog'])
  })

  it('is Arabic under an Arabic provider', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar">{dialog}</TopClassProvider>))
      .toEqual(['إغلاق هذا الحوار', 'إغلاق هذا الحوار'])
  })

  it('is Arabic for a regional Arabic locale too, since the language decides', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar-EG">{dialog}</TopClassProvider>))
      .toEqual(['إغلاق هذا الحوار', 'إغلاق هذا الحوار'])
  })

  it('follows the nearest provider, so an Arabic island on an English page names its x in Arabic', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar">{dialog}</TopClassProvider>
      </TopClassProvider>,
    )).toEqual(['إغلاق هذا الحوار', 'إغلاق هذا الحوار'])
  })

  it('follows an app that changes that one string, and leaves the rest of the labels alone', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en" labels={{ dialog: { close: 'Close the window' } }}>{dialog}</TopClassProvider>,
    )).toEqual(['Close the window', 'Close the window'])
  })

  it('reads dialog.close, not the shorter common.close, in both languages', () => {
    expect(en.dialog.close).toBe('Close this dialog')
    expect(en.common.close).toBe('Close')
    expect(ar.dialog.close).toBe('إغلاق هذا الحوار')
    expect(ar.common.close).toBe('إغلاق')
  })

  it('writes no English into the markup of an Arabic dialog', async () => {
    render(<TopClassProvider direction="rtl" locale="ar">{dialog}</TopClassProvider>)
    const popup = await screen.findByRole('dialog')
    expect(popup.outerHTML).not.toContain('Close')
    expect(popup.outerHTML).not.toMatch(/labels=|\[object/)
  })
})
