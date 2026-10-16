'use client'

import { usePortalLocale } from '#shared/provider/use-portal-locale.js'

/** What TooltipPopup reads from the provider: the dir and the lang its positioner carries, since
 * a portal inherits neither from an island. Floating UI aligns by the first, and the popup's text,
 * its logical classes and its arrow inherit both. With no provider the page's own apply. */
export function useTooltipPopup() {
  return usePortalLocale()
}
