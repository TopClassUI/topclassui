import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The states a server can render. Only the first bar sticks, since two would write the same
 * --tc-sticky-top; each nav has a name of its own, so the two are told apart. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <NavbarRoot>
        <NavbarBrand href="/">TopClass UI</NavbarBrand>
        <NavbarLinks aria-label="Sticky, Docs being read">
          <NavbarLink href="/docs" current>Docs</NavbarLink>
          <NavbarLink href="/components">Components</NavbarLink>
          <NavbarLink href="/icons">Icons</NavbarLink>
          <NavbarLink href="/theming">Theming</NavbarLink>
        </NavbarLinks>
        <NavbarActions>
          <Button render={<a href="/login" />}>Sign in</Button>
        </NavbarActions>
      </NavbarRoot>
      <NavbarRoot sticky={false}>
        <NavbarBrand href="/">TopClass UI</NavbarBrand>
        <NavbarLinks aria-label="In the flow, nothing being read">
          <NavbarLink href="/blog">Blog</NavbarLink>
          <NavbarLink href="/changelog">Changelog</NavbarLink>
        </NavbarLinks>
      </NavbarRoot>
    </div>
  )
}
