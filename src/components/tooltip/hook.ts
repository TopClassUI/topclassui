'use client'

import { useDirection, useLocale } from '#shared/provider/context.js'

/** What TooltipPopup reads from the provider. Its portal sits in the body, outside any island,
 * so the positioner carries the direction and the language itself: Floating UI aligns by the
 * first, and the popup's text, its logical classes and its arrow inherit both. */
export function useTooltipPopup() {
  return { direction: useDirection(), locale: useLocale() }
}
