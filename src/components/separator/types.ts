import type { ComponentPropsWithRef } from 'react'

import type { SEPARATOR_ORIENTATIONS } from './constants.js'
import type { SeparatorSchemaInput } from './schema.js'

export type SeparatorOrientation = (typeof SEPARATOR_ORIENTATIONS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SeparatorDesignProps = {
  [K in keyof SeparatorSchemaInput]?: SeparatorSchemaInput[K] | undefined
}

/** No children: the labelled form is not built. `decorative` and `orientation` decide the
 * role and aria-orientation, so a caller cannot set either against them. */
export type SeparatorProps =
  Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML' | 'role' | 'aria-orientation'>
  & SeparatorDesignProps
