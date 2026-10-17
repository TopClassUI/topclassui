import type { ComponentPropsWithRef } from 'react'

/** No design prop of its own: the native `<kbd>` props, so `children`, `className`,
 * `style`, `ref` and the rest all reach the element. */
export type KbdProps = ComponentPropsWithRef<'kbd'>
