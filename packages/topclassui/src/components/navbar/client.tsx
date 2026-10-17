'use client'

import { useNavbarOffset } from './hook.js'

/** Draws nothing. Inside a sticky NavbarRoot it publishes the height of that bar as --tc-sticky-top,
 * which the page reads into scroll-padding: an #anchor target or a focused link lands below the bar. */
export function NavbarOffset() {
  const { ref } = useNavbarOffset()
  return <span ref={ref} hidden />
}
