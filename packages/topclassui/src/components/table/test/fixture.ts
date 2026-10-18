import type { RootPropsFixture } from '#test/root-props.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  Table: {
    props: {
      caption: 'Probe',
      items: ['a'],
      getKey: (item) => String(item),
      columns: [{ key: 'a', header: 'Probe', cell: (item) => String(item) }],
    },
  },
  TableSkeleton: { props: {} },
}
