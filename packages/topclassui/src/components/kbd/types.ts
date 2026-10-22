import type { ComponentPropsWithRef } from 'react'

import type { KbdSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type KbdDesignProps = {
  [K in keyof KbdSchemaInput]?: KbdSchemaInput[K] | undefined
}

/** The native `<kbd>` props, so `children`, `className`, `style`, `ref` and the rest all
 * reach the element, plus the two states Figma 135:411 draws. */
export interface KbdProps extends ComponentPropsWithRef<'kbd'>, KbdDesignProps {}
