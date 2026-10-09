import type { ComponentPropsWithRef } from 'react'

import type { SKELETON_VARIANTS } from './constants.js'
import type { SkeletonSchemaInput } from './schema.js'

export type SkeletonVariant = (typeof SKELETON_VARIANTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SkeletonDesignProps = {
  [K in keyof SkeletonSchemaInput]?: SkeletonSchemaInput[K] | undefined
}

/** No content and no way to un-hide it: a placeholder only holds a shape, sized by className. */
export type SkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & SkeletonDesignProps
