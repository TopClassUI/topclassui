import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

const DECISION = '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  DatePicker: {
    props: { 'aria-label': 'Probe' },
    target: { className: ':scope > button', style: ':scope > button', ref: ':scope > button', data: ':scope > button', decision: DECISION },
  },
}
