import type { ComponentPropsWithRef } from 'react'

/** The native `<kbd>` props, so `children`, `className`, `style`, `ref` and the rest all
 * reach the element, plus the two states Figma 135:411 draws. */
export interface KbdProps extends ComponentPropsWithRef<'kbd'> {
  /** The key is held down: the cap drops from the raised surface to the surface below it. */
  pressed?: boolean | undefined
  /** The key does nothing here: the whole cap at half strength. */
  disabled?: boolean | undefined
}
