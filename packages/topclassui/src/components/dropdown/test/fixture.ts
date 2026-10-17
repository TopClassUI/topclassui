import { createElement } from 'react'
import type { ReactElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { DropdownGroup, DropdownPopup, DropdownRoot } from '../index.js'
import type * as Index from '../index.js'

const HEADLESS = { decision: '2026-10-17 - Every export is proven to pass className, ref and data-* on, and where they land instead' }
const inPopup = (el: ReactElement) => createElement(DropdownRoot, { defaultOpen: true }, createElement(DropdownPopup, null, el))

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  DropdownRoot: { props: {}, headless: HEADLESS },
  DropdownTrigger: { props: {}, wrap: (el) => createElement(DropdownRoot, null, el) },
  DropdownPopup: { props: {}, wrap: (el) => createElement(DropdownRoot, { defaultOpen: true }, el), portal: true },
  DropdownItem: { props: { children: 'Probe' }, wrap: inPopup, portal: true },
  DropdownLinkItem: { props: { href: '#probe', children: 'Probe' }, wrap: inPopup, portal: true },
  DropdownSeparator: { props: {}, wrap: inPopup, portal: true },
  DropdownGroup: { props: {}, wrap: inPopup, portal: true },
  DropdownGroupLabel: { props: {}, wrap: (el) => inPopup(createElement(DropdownGroup, null, el)), portal: true },
  DropdownMenu: {
    props: { defaultOpen: true, title: 'Probe', trigger: createElement('button'), items: [{ id: 'a', label: 'Probe', href: '#probe' }] },
    portal: true,
  },
}
