import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The drawn bar: the brand, four links with the page being read marked, and one action.
 * Each link is the anchor the part renders; a Next.js app passes render={<Link href="/docs" />}. */
export default function Demo() {
  return (
    <NavbarRoot>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="#docs" current>Docs</NavbarLink>
        <NavbarLink href="#components">Components</NavbarLink>
        <NavbarLink href="#icons">Icons</NavbarLink>
        <NavbarLink href="#themes">Theming</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button render={<a href="#sign-in" />}>Sign in</Button>
      </NavbarActions>
    </NavbarRoot>
  )
}
