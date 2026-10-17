import { cn } from '#shared/cn.js'
import { NavbarOffset } from '../client.js'
import { NAVBAR_ROOT, NAVBAR_TOP } from '../classes.js'
import { NAVBAR_DEFAULTS } from '../constants.js'
import type { NavbarRootProps } from '../types.js'

/** The bar, a header. Sticky unless told otherwise: it then holds NavbarOffset, the one
 * client part, which tells the page how tall the bar is. */
export function NavbarRoot({
  sticky = NAVBAR_DEFAULTS.sticky,
  className,
  children,
  ...rest
}: NavbarRootProps) {
  return (
    <header className={cn(NAVBAR_ROOT, NAVBAR_TOP[sticky ? 'sticky' : 'flow'], className)} {...rest}>
      {children}
      {sticky ? <NavbarOffset /> : null}
    </header>
  )
}
