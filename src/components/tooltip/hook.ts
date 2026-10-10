'use client'

import { useDirection } from '#shared/provider/context.js'

/** What TooltipPopup reads from the provider. Its portal sits in the body, outside any island,
 * so the positioner carries this direction itself: Floating UI aligns by it, and the popup's
 * text, its logical classes and its arrow inherit it. */
export function useTooltipPopup() {
  return { direction: useDirection() }
}
