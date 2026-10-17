import { createElement } from 'react'

import type { RootPropsFixture } from '#test/root-props.js'
import { Toast } from '@base-ui/react/toast'
import type * as Index from '../index.js'

// R-5.7-3: the required props of each export, read by src/test/root-props.dom.test.tsx.
export const fixture: RootPropsFixture<typeof Index> = {
  ToastViewport: { props: {}, wrap: (el) => createElement(Toast.Provider, null, el), portal: true },
}
