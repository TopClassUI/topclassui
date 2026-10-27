import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { palette } from '#icons/data/palette.js'
import type { NavbarDesignProps } from '../types.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** The bar the docs' Try it drives: sticky and variant go to the root, and current marks the Docs link.
 * The brand opens on the logo tile Figma 138:2393 draws; a logo is the caller's content. */
export default function Demo({ current, ...props }: NavbarDesignProps = {}) {
  return (
    <NavbarRoot {...props}>
      <NavbarBrand href="/">
        <span className="inline-flex rounded-chip bg-primary-solid p-1 text-primary-on-solid"><Svg icon={palette} /></span>
        TopClass UI
      </NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="#docs" current={current}>Docs</NavbarLink>
        <NavbarLink href="#components">Components</NavbarLink>
        <NavbarLink href="#icons">Icons</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button render={<a href="#sign-in" />}>Sign in</Button>
      </NavbarActions>
    </NavbarRoot>
  )
}
