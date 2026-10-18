import type { RootPropsFixture } from '#test/root-props.js'
import { check } from '#icons/data/check.js'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  Svg: { props: { icon: check } },
}
