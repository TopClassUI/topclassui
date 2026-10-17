import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  Combobox: {
    props: { 'aria-label': 'Probe', items: [{ value: 'a', label: 'Probe' }] },
    target: { className: 'input', ref: 'input', data: 'input', decision: '2026-10-15 - Unit 4: where it departs from its plan' },
  },
}
