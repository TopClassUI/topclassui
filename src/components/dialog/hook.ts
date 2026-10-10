'use client'

import { useDirection, useLabels } from '#shared/provider/context.js'

/** What DialogPopup reads from the provider. Its portal sits in the body, outside any island,
 * so the viewport carries this direction itself, and the popup, its header, its x and its
 * footer inherit it. */
export function useDialogPopup() {
  return { direction: useDirection() }
}

/** The name of the x, in the language of the provider: English when none is mounted. */
export function useDialogClose() {
  return { label: useLabels().dialog.close }
}
