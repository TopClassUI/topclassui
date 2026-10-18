import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { NavbarLinks } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  NavbarRoot: { props: {} },
  NavbarBrand: { props: {} },
  NavbarLinks: { props: {} },
  NavbarLink: { props: { href: '#probe', children: 'Probe' }, wrap: (el) => createElement(NavbarLinks, null, el) },
  NavbarActions: { props: {} },
}
