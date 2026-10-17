import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { AvatarGroupSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type AvatarGroupDesignProps = {
  [K in keyof AvatarGroupSchemaInput]?: AvatarGroupSchemaInput[K] | undefined
}

/** The role is always group, and the content is always the children it counts. */
type Owned = 'children' | 'role' | 'dangerouslySetInnerHTML'

export interface AvatarGroupProps
  extends Omit<ComponentPropsWithRef<'span'>, Owned>, AvatarGroupDesignProps {
  /** Every member, one avatar per child; the group shows the first `max` and counts the rest. */
  children?: ReactNode | undefined
  /** The built-in strings; the counter is named by `labels.avatar.more`. Defaults to English. */
  labels?: Labels | undefined
  /** The BCP 47 tag the count is formatted in. Defaults to `en`. */
  locale?: string | undefined
}
