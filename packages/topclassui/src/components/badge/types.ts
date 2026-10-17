import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { BADGE_VARIANTS } from './constants.js'
import type { BadgeSchemaInput } from './schema.js'

export type BadgeVariant = (typeof BADGE_VARIANTS)[number]

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type BadgeTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type BadgeDesignProps = {
  [K in keyof BadgeSchemaInput]?: BadgeSchemaInput[K] | undefined
}

export interface BadgeProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children'>, BadgeDesignProps {
  /** The label, and any icon beside it. The text carries the meaning; colour never does alone. */
  children?: ReactNode | undefined
}

/** R-8.3-4: the badge's own size prop, so the two cannot describe different boxes. */
export type BadgeSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<BadgeDesignProps, 'size'>
