import { createElement } from 'react'
import type { ReactElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { DrawerPopup, DrawerRoot } from '../index.js'
import type * as Index from '../index.js'

const POPUP = { root: '[role="dialog"]', decision: '2026-10-17 - A popup part lands on the popup, inside the presentation boxes Base UI wraps it in' }
const HEADLESS = { decision: '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead' }
const inPopup = (el: ReactElement) => createElement(DrawerRoot, { defaultOpen: true }, createElement(DrawerPopup, { 'aria-label': 'Probe' }, el))

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  DrawerRoot: { props: {}, headless: HEADLESS },
  DrawerTrigger: { props: {}, wrap: (el) => createElement(DrawerRoot, null, el) },
  DrawerPopup: { props: { 'aria-label': 'Probe' }, wrap: (el) => createElement(DrawerRoot, { defaultOpen: true }, el), portal: POPUP },
  DrawerHeader: { props: {}, wrap: inPopup },
  DrawerBody: { props: {}, wrap: inPopup },
  DrawerFooter: { props: {}, wrap: inPopup },
  DrawerTitle: { props: {}, wrap: inPopup },
  DrawerDescription: { props: {}, wrap: inPopup },
  DrawerClose: { props: {}, wrap: inPopup },
}
