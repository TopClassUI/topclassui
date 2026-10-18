import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { RadioGroupRoot } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  RadioGroupRoot: { props: { 'aria-label': 'Probe' } },
  RadioGroupItem: {
    props: { value: 'a' },
    wrap: (el) => createElement(RadioGroupRoot, { 'aria-label': 'Probe' }, el),
    target: { ref: ':scope > button[role="radio"]', data: ':scope > button[role="radio"]', decision: '2026-10-15 - Unit 4: where it departs from its plan' },
  },
}
