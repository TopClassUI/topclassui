import { NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** sticky={false}: the bar scrolls away with the page, sends no JavaScript to the browser
 * and leaves --tc-sticky-top alone. */
export default function Demo() {
  return (
    <NavbarRoot sticky={false}>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs">Docs</NavbarLink>
        <NavbarLink href="/blog" current>Blog</NavbarLink>
        <NavbarLink href="/changelog">Changelog</NavbarLink>
      </NavbarLinks>
    </NavbarRoot>
  )
}
