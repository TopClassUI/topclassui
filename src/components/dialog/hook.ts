'use client'

import { createContext, useContext, useImperativeHandle, useRef } from 'react'

import { useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { DIALOG_DEFAULTS } from './constants.js'
import type { DialogBodyProps, DialogModal } from './types.js'

/** How modal the nearest DialogRoot is. The root provides it, because Base UI tells the popup
 * nothing: only a dialog that blocks the page may dim it and catch its presses. */
export const DialogModalContext = createContext(DIALOG_DEFAULTS.modal as DialogModal)

/** What DialogPopup reads: the dir and the lang of the provider, which its portal in the body
 * cannot inherit and its viewport therefore carries, and how modal its root is. */
export function useDialogPopup() {
  return { ...usePortalLocale(), modal: useContext(DialogModalContext) }
}

/** The body's own ref, which the caller's ref follows, and the tabIndex it needs: 0 only while
 * its content overflows it, so a long text can be scrolled from the keyboard. */
export function useDialogBody(forwarded: DialogBodyProps['ref']) {
  const ref = useRef(null as HTMLDivElement | null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement, [])
  return { ref, tabIndex: useScrollTabStop(ref) }
}

/** The name of the x, in the language of the provider: English when none is mounted. */
export function useDialogClose() {
  return { label: useLabels().dialog.close }
}
