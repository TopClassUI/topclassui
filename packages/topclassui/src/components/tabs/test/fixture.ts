import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { TabsList, TabsRoot } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  TabsRoot: { props: { defaultValue: 'a' } },
  TabsList: { props: { 'aria-label': 'Probe' }, wrap: (el) => createElement(TabsRoot, { defaultValue: 'a' }, el) },
  TabsTab: {
    props: { value: 'a' },
    wrap: (el) => createElement(TabsRoot, { defaultValue: 'a' }, createElement(TabsList, { 'aria-label': 'Probe' }, el)),
  },
  TabsPanel: { props: { value: 'a' }, wrap: (el) => createElement(TabsRoot, { defaultValue: 'a' }, el) },
}
