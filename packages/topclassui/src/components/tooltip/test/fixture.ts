import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { TooltipRoot } from '../index.js'
import type * as Index from '../index.js'

const POPUP = { root: '[data-base-ui-portal] > [role="presentation"] > div', decision: '2026-10-17 - A popup part lands on the popup, inside the presentation boxes Base UI wraps it in' }
const HEADLESS = { decision: '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead' }

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  TooltipRoot: { props: {}, headless: HEADLESS },
  TooltipProvider: { props: {}, headless: HEADLESS },
  TooltipTrigger: { props: {}, wrap: (el) => createElement(TooltipRoot, null, el) },
  TooltipPopup: { props: {}, wrap: (el) => createElement(TooltipRoot, { defaultOpen: true }, el), portal: POPUP },
}
