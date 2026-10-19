import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The states a server can render: the solid bar at the top of the page, one in the flow and the transparent look.
 * Only the first bar sticks, since two would write the same --tc-sticky-top. Each bar is named by its state, each nav of its own. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <NavbarRoot aria-label="top">
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
      <NavbarRoot aria-label="in the flow" sticky={false}>
        <NavbarBrand href="/">TopClass UI</NavbarBrand>
        <NavbarLinks aria-label="In the flow, nothing being read">
          <NavbarLink href="/blog">Blog</NavbarLink>
          <NavbarLink href="/changelog">Changelog</NavbarLink>
        </NavbarLinks>
      </NavbarRoot>
      <NavbarRoot aria-label="transparent" sticky={false} variant="transparent">
        <NavbarBrand href="/">TopClass UI</NavbarBrand>
        <NavbarLinks aria-label="Transparent, on the page">
          <NavbarLink href="/about">About</NavbarLink>
        </NavbarLinks>
      </NavbarRoot>
    </div>
  )
}
