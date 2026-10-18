import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

// A held Textarea: the textarea is the first child of the holder that also holds the counter.
const HELD = ':scope > textarea'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  Textarea: [
    { props: { 'aria-label': 'Probe' } },
    {
      props: { 'aria-label': 'Probe', showCount: true },
      target: { className: HELD, style: HELD, ref: HELD, data: HELD, decision: '2026-10-15 - Unit 4: where it departs from its plan' },
    },
  ],
  TextareaSkeleton: { props: {} },
}
