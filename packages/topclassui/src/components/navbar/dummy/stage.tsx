import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { bell } from '#icons/data/bell.js'
import { palette } from '#icons/data/palette.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The stage Figma 138:2393 draws: a rounded bar in the flow, the logo tile and the name, Docs as the page being read, and
 * a bell and the account at the end. The card look is the caller's className; a page-wide bar stays square. */
export default function Demo() {
  return (
    <NavbarRoot sticky={false} className="max-w-115 rounded-box">
      <NavbarBrand href="/">
        <span className="inline-flex rounded-chip bg-primary-solid p-1 text-primary-on-solid"><Svg icon={palette} /></span>
        TopClass
      </NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs" current>Docs</NavbarLink>
        <NavbarLink href="/components">Components</NavbarLink>
        <NavbarLink href="/icons">Icons</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button variant="ghost" aria-label="Notifications"><Svg icon={bell} /></Button>
        <AvatarRoot size="sm" aria-label="Omar Abed">
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
      </NavbarActions>
    </NavbarRoot>
  )
}
