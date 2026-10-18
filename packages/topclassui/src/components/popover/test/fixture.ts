import { createElement } from 'react'
import type { ReactElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { PopoverPopup, PopoverRoot } from '../index.js'
import type * as Index from '../index.js'

const POPUP = { root: '[role="dialog"]', decision: '2026-10-17 - A popup part lands on the popup, inside the presentation boxes Base UI wraps it in' }
const HEADLESS = { decision: '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead' }
const inPopup = (el: ReactElement) => createElement(PopoverRoot, { defaultOpen: true }, createElement(PopoverPopup, null, el))

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  PopoverRoot: { props: {}, headless: HEADLESS },
  PopoverTrigger: { props: {}, wrap: (el) => createElement(PopoverRoot, null, el) },
  PopoverPopup: { props: {}, wrap: (el) => createElement(PopoverRoot, { defaultOpen: true }, el), portal: POPUP },
  PopoverTitle: { props: {}, wrap: inPopup },
  PopoverDescription: { props: {}, wrap: inPopup },
  PopoverClose: { props: {}, wrap: inPopup },
}
