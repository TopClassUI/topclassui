import { NavbarBrand, NavbarRoot } from '../index.js'

/** The ring a focused brand wears, drawn at rest so the strip can show it; not under forced colours, where a ring at
 * rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** A plain tile and the name, as the frame's cells draw the brand. */
const Logo = () => <><span className="size-3.5 rounded-chip bg-primary-solid" />TopClass</>

/** The frame's 8 px mono name beside its tile. */
const BRAND = 'gap-1.5 font-mono text-xs font-normal'

/** A small bar drawn as a card at the frame's 132 px, in the caller's className. */
const BAR = 'w-33 min-h-8 rounded-chip border-(length:--tc-line-width) ps-2 pe-2 py-0'

/** The states the frame draws that a server can render, a brand-only bar each at 132 px, named by its state: the bar at the
 * top, the shadow it takes once the page has scrolled under it, the ring on its brand, and the transparent look.
 * Mobile and the open menu are recorded as not built. None sticks, so the top bar never takes the scrolled shadow on a long page. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <NavbarRoot aria-label="top" sticky={false} className={BAR}>
        <NavbarBrand href="/" className={BRAND}><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="scrolled" sticky={false} className={`${BAR} shadow-md`}>
        <NavbarBrand href="/" className={BRAND}><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="focus-visible" sticky={false} className={BAR}>
        <NavbarBrand href="/" className={`${BRAND} ${RING}`}><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="transparent" sticky={false} variant="transparent" className={BAR}>
        <NavbarBrand href="/" className={BRAND}><Logo /></NavbarBrand>
      </NavbarRoot>
    </div>
  )
}
