import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { AVATAR_SIZES } from './constants.js'
import type { AvatarSchemaInput } from './schema.js'

export type AvatarSize = (typeof AVATAR_SIZES)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type AvatarDesignProps = {
  [K in keyof AvatarSchemaInput]?: AvatarSchemaInput[K] | undefined
}

export interface AvatarRootProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children'>, AvatarDesignProps {
  /** The parts: an AvatarFallback, and an AvatarImage when there is a picture. */
  children?: ReactNode | undefined
}

export interface AvatarFallbackProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Initials, or an Svg icon. Shown while the image loads and when there is none. */
  children?: ReactNode | undefined
}

export interface AvatarImageProps
  extends Omit<ComponentPropsWithRef<'img'>, 'alt' | 'children' | 'dangerouslySetInnerHTML'> {
  /** Who the picture shows. Pass an empty string when the name is written beside it. */
  alt: string
}

/** R-8.3-4: the avatar's own size prop, so the two cannot describe different boxes. */
export type AvatarSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<AvatarDesignProps, 'size'>
