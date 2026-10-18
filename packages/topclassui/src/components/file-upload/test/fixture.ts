import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  FileUpload: {
    props: { 'aria-label': 'Probe' },
    target: { data: ':scope input[type="file"]', decision: '2026-10-15 - Unit 5: where it departs from its plan' },
  },
}
