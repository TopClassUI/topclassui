import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { SegmentedControlRoot } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  SegmentedControlRoot: {
    props: { 'aria-label': 'Probe', defaultValue: 'a' },
    target: { className: '[role="radiogroup"]', ref: '[role="radiogroup"]', data: '[role="radiogroup"]', decision: '2026-10-15 - Unit 4: where it departs from its plan' },
  },
  SegmentedControlItem: { props: { value: 'a' }, wrap: (el) => createElement(SegmentedControlRoot, { 'aria-label': 'Probe', defaultValue: 'a' }, el) },
}
