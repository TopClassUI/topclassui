import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot, NavbarSkeleton } from '../index.js'

/** The drawn bar above the skeleton that holds its place, in one wrapper: the same box. One pair,
 * since a second header would be a second banner landmark. Neither sticks, so they stack. */
export default function Demo() {
  return (
    <div data-pair="four-links" className="grid gap-2">
      <NavbarRoot sticky={false}>
        <NavbarBrand href="/">TopClass UI</NavbarBrand>
        <NavbarLinks>
          <NavbarLink href="/docs" current>Docs</NavbarLink>
          <NavbarLink href="/components">Components</NavbarLink>
          <NavbarLink href="/icons">Icons</NavbarLink>
          <NavbarLink href="/theming">Theming</NavbarLink>
        </NavbarLinks>
        <NavbarActions>
          <Button render={<a href="/login" />}>Sign in</Button>
        </NavbarActions>
      </NavbarRoot>
      <NavbarSkeleton sticky={false} links={4} />
    </div>
  )
}
