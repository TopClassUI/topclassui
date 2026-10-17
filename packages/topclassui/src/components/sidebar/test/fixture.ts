import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { SidebarGroup, SidebarRoot } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  SidebarRoot: { props: {} },
  SidebarTrigger: { props: {}, wrap: (el) => createElement(SidebarRoot, null, el) },
  SidebarHeader: { props: {}, wrap: (el) => createElement(SidebarRoot, null, el) },
  SidebarBody: { props: {}, wrap: (el) => createElement(SidebarRoot, null, el) },
  SidebarGroup: { props: {}, wrap: (el) => createElement(SidebarRoot, null, el) },
  SidebarLink: { props: { href: '#probe', children: 'Probe' }, wrap: (el) => createElement(SidebarRoot, null, createElement(SidebarGroup, null, el)) },
}
