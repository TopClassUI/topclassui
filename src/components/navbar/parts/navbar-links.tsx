import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { NAVBAR_LINKS, NAVBAR_LIST } from '../classes.js'
import type { NavbarLinksProps } from '../types.js'

/** The navigation landmark and its list. It scrolls sideways inside the bar when the links
 * do not fit, so the page never grows wider. Named by the label unless the caller names it. */
export function NavbarLinks({
  labels = en,
  locale: _locale,
  'aria-label': ariaLabel,
  className,
  children,
  ...rest
}: NavbarLinksProps) {
  // An empty aria-label names nothing, and aria-labelledby already names it: the label stands in for neither.
  const named = Boolean(ariaLabel) || Boolean(rest['aria-labelledby'])

  return (
    <nav aria-label={named ? ariaLabel : labels.navbar.label} className={cn(NAVBAR_LINKS, className)} {...rest}>
      {/* Preflight removes the list style, and Safari with VoiceOver can then drop the list role. */}
      <ul role="list" className={NAVBAR_LIST}>{children}</ul>
    </nav>
  )
}
