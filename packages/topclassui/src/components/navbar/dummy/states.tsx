import { Svg } from '#components/svg/index.js'
import { palette } from '#icons/data/palette.js'
import { NavbarBrand, NavbarRoot } from '../index.js'

/** The ring a focused brand wears, drawn at rest so the strip can show it; not under forced colours, where a ring at
 * rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The logo tile and the name, as the frame's cells draw the brand. */
const Logo = () => <><span className="inline-flex rounded-chip bg-primary-solid p-1 text-primary-on-solid"><Svg icon={palette} /></span>TopClass</>

/** The states the frame draws that a server can render, a brand-only bar each, as wide as its brand, named by its state: the bar at the
 * top, the shadow it takes once the page has scrolled under it, the ring on its brand, and the transparent look.
 * Mobile and the open menu are recorded as not built. Only the first bar sticks, since two would write the same --tc-sticky-top. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <NavbarRoot aria-label="top" className="w-auto">
        <NavbarBrand href="/"><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="scrolled" sticky={false} className="w-auto shadow-md">
        <NavbarBrand href="/"><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="focus-visible" sticky={false} className="w-auto">
        <NavbarBrand href="/" className={RING}><Logo /></NavbarBrand>
      </NavbarRoot>
      <NavbarRoot aria-label="transparent" sticky={false} variant="transparent" className="w-auto">
        <NavbarBrand href="/"><Logo /></NavbarBrand>
      </NavbarRoot>
    </div>
  )
}
