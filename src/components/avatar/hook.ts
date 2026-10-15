'use client'

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import type { AvatarImageError, AvatarImageProps } from './types.js'

/** What AvatarImage reads: its img, whether that img failed, and the handler that learns it.
 * A failure is kept with its src, and a new src starts again in the very render that brings it. */
export function useAvatarImage(src: unknown, forwarded: AvatarImageProps['ref'], onError: AvatarImageProps['onError']) {
  const ref = useRef(null as HTMLImageElement | null)
  useImperativeHandle(forwarded, () => ref.current as HTMLImageElement)
  const [state, setState] = useState({ src, broken: false })
  // Also drops a failure that lands once the src has moved on: it names the old src.
  if (!Object.is(state.src, src)) setState({ src, broken: false })
  const fail = useCallback(() => { setState({ src, broken: true }) }, [src])

  // An image that failed before the script ran fired its error event at no listener.
  useEffect(() => {
    const image = ref.current
    if (!image?.complete || image.naturalWidth > 0) return
    // decode() rejects only a broken image, so one that reads 0 wide for any other reason stays.
    image.decode().catch(fail)
  }, [fail])

  const handleError = useCallback((event: AvatarImageError) => {
    fail()
    onError?.(event)
  }, [fail, onError])

  return { ref, failed: state.broken, onError: handleError }
}
