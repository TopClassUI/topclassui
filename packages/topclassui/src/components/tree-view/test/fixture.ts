import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

const DECISION = '2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  TreeView: {
    props: { 'aria-label': 'Probe', items: [{ id: 'a', label: 'Probe' }] },
    target: { className: ':scope > [role="tree"]', style: ':scope > [role="tree"]', ref: ':scope > [role="tree"]', data: ':scope > [role="tree"]', decision: DECISION },
  },
}
