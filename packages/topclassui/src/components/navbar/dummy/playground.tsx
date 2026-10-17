import { Button } from '#components/button/index.js'
import type { NavbarDesignProps } from '../types.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The bar the docs' Try it drives: sticky goes to the root, and current marks the Docs link. */
export default function Demo({ current, ...props }: NavbarDesignProps = {}) {
  return (
    <NavbarRoot {...props}>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs" current={current}>Docs</NavbarLink>
        <NavbarLink href="/components">Components</NavbarLink>
        <NavbarLink href="/icons">Icons</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button render={<a href="/login" />}>Sign in</Button>
      </NavbarActions>
    </NavbarRoot>
  )
}
