import { githubLogo } from '#icons/data/github-logo.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** Six links and two actions: more than a phone has room for. The links scroll sideways
 * inside the bar, and the page stays as wide as the screen. */
export default function Demo() {
  return (
    <NavbarRoot>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/docs">Docs</NavbarLink>
        <NavbarLink href="/components" current>Components</NavbarLink>
        <NavbarLink href="/icons">Icons</NavbarLink>
        <NavbarLink href="/theming">Theming</NavbarLink>
        <NavbarLink href="/connectors">Connectors</NavbarLink>
        <NavbarLink href="/changelog">Changelog</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button variant="ghost" aria-label="GitHub" render={<a href="https://github.com/TopClassUI/topclassui" rel="noopener noreferrer" />}>
          <Svg icon={githubLogo} />
        </Button>
        <Button render={<a href="/login" />}>Sign in</Button>
      </NavbarActions>
    </NavbarRoot>
  )
}
