import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { AvatarRoot } from '../index.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  AvatarRoot: { props: {} },
  AvatarImage: { props: { src: '/probe.png', alt: 'Probe' }, wrap: (el) => createElement(AvatarRoot, null, el) },
  AvatarFallback: { props: {}, wrap: (el) => createElement(AvatarRoot, null, el) },
  AvatarSkeleton: { props: {} },
}
