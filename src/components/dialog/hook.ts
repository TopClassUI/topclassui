'use client'

import { createContext, useContext } from 'react'

import { useDirection, useLabels } from '#shared/provider/context.js'
import { DIALOG_DEFAULTS } from './constants.js'
import type { DialogModal } from './types.js'

/** How modal the nearest DialogRoot is. The root provides it, because Base UI tells the popup
 * nothing: only a dialog that blocks the page may dim it and catch its presses. */
export const DialogModalContext = createContext(DIALOG_DEFAULTS.modal as DialogModal)

/** What DialogPopup reads: the direction of the provider, which its portal in the body cannot
 * inherit and its viewport therefore carries, and how modal its root is. */
export function useDialogPopup() {
  return { direction: useDirection(), modal: useContext(DialogModalContext) }
}

/** The name of the x, in the language of the provider: English when none is mounted. */
export function useDialogClose() {
  return { label: useLabels().dialog.close }
}
