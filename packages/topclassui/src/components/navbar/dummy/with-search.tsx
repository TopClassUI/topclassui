import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { Input } from '#components/input/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** A search field and the account at the end of the bar. NavbarActions styles neither: the
 * form is the caller's, and it works with no script because it is a plain GET. */
export default function Demo() {
  return (
    <NavbarRoot>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs" current>Docs</NavbarLink>
        <NavbarLink href="/components">Components</NavbarLink>
        <NavbarLink href="/icons">Icons</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <form role="search" action="/search" className="min-w-0">
          <Input type="search" name="q" size="sm" placeholder="Search" aria-label="Search the docs" />
        </form>
        <AvatarRoot size="sm" aria-label="Omar Abed">
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
      </NavbarActions>
    </NavbarRoot>
  )
}
