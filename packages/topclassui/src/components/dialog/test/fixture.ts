import { createElement } from 'react'
import type { ReactElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { DialogPopup, DialogRoot } from '../index.js'
import type * as Index from '../index.js'

const POPUP = { root: '[role="dialog"]', decision: '2026-10-17 - A popup part lands on the popup, inside the presentation boxes Base UI wraps it in' }
const HEADLESS = { decision: '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead' }
const inPopup = (el: ReactElement) => createElement(DialogRoot, { defaultOpen: true }, createElement(DialogPopup, { 'aria-label': 'Probe' }, el))

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  DialogRoot: { props: {}, headless: HEADLESS },
  DialogTrigger: { props: {}, wrap: (el) => createElement(DialogRoot, null, el) },
  DialogPopup: { props: { 'aria-label': 'Probe' }, wrap: (el) => createElement(DialogRoot, { defaultOpen: true }, el), portal: POPUP },
  DialogHeader: { props: {}, wrap: inPopup },
  DialogBody: { props: {}, wrap: inPopup },
  DialogFooter: { props: {}, wrap: inPopup },
  DialogTitle: { props: {}, wrap: inPopup },
  DialogDescription: { props: {}, wrap: inPopup },
  DialogClose: { props: {}, wrap: inPopup },
}
