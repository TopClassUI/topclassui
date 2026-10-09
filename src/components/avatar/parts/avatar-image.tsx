import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { AVATAR_IMAGE } from '../classes.js'
import type { AvatarImageProps } from '../types.js'

/** The picture, filling the circle over the fallback. A plain img, or the element in
 * `render`, such as next/image. Hiding a broken one needs onError, which is the client half. */
export function AvatarImage({ alt, className, render, ...rest }: AvatarImageProps) {
  return renderElement(render ?? <img />, { alt, className: cn(AVATAR_IMAGE, className), ...rest })
}
