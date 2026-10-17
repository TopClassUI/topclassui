import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  Command: {
    props: {
      defaultOpen: true, items: ['probe'], getKey: (item) => String(item), getLabel: (item) => String(item), onSelect: () => undefined,
    },
    portal: true,
  },
}
