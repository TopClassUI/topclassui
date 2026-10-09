import { cn } from '#shared/cn.js'
import { AVATAR_IMAGE } from '../classes.js'
import type { AvatarImageProps } from '../types.js'

/** The picture, filling the circle over the fallback. A plain img: hiding a broken one
 * needs onError, which is the client half. */
export function AvatarImage({ alt, className, ...rest }: AvatarImageProps) {
  return <img alt={alt} className={cn(AVATAR_IMAGE, className)} {...rest} />
}
