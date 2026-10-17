'use client'

import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { AVATAR_IMAGE } from './classes.js'
import { useAvatarImage } from './hook.js'
import { readSource } from './lib.js'
import type { AvatarImageProps } from './types.js'

/** The picture, filling the circle over the fallback: a plain img, or the element in `render`,
 * such as next/image. One that fails turns transparent and stays, so its alt still names it. */
export function AvatarImage({ alt, className, render, ref, onError, onLoad, ...rest }: AvatarImageProps) {
  const image = useAvatarImage(readSource(rest, render), { ref, onError, onLoad })
  return renderElement(render ?? <img />, {
    alt,
    className: cn(AVATAR_IMAGE, className),
    ...rest,
    'data-error': image.failed ? '' : undefined,
    ref: image.ref,
    onError: image.onError,
    onLoad: image.onLoad,
  })
}
