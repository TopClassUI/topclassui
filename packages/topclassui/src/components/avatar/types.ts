import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

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
  /** Initials or an Svg icon, shown until the image paints. Decorative: aria-hidden unless you pass false. */
  children?: ReactNode | undefined
}

/** A plain img, which the type will not let through without its alt. */
interface AvatarImageAsImg {
  render?: undefined
  /** Who the picture shows. Pass an empty string when the name is written beside it. */
  alt: string
}

// R-5.7-4: the element form only, so it resolves without a hook in a Server Component.
interface AvatarImageAsElement {
  /** Render the picture as another element, such as next/image, which carries its own src and alt. */
  render: ReactElement
  alt?: string | undefined
}

export type AvatarImageProps =
  Omit<ComponentPropsWithRef<'img'>, 'alt' | 'children' | 'dangerouslySetInnerHTML'>
  & (AvatarImageAsImg | AvatarImageAsElement)

/** The event an img that fails hands its onError: what useAvatarImage passes on to the caller's. */
export type AvatarImageError = Parameters<NonNullable<AvatarImageProps['onError']>>[0]

/** The event an img that loads hands its onLoad. */
export type AvatarImageLoad = Parameters<NonNullable<AvatarImageProps['onLoad']>>[0]

/** What useAvatarImage keeps a failure against: the src and srcSet the img renders with. */
export interface AvatarImageSource { src: unknown, srcSet: unknown }

/** The caller's ref and handlers, which useAvatarImage takes over and still calls. */
export type AvatarImageHandlers = Pick<AvatarImageProps, 'ref' | 'onError' | 'onLoad'>

/** R-8.3-4: the avatar's own size prop, so the two cannot describe different boxes. */
export type AvatarSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<AvatarDesignProps, 'size'>
