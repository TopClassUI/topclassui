'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { AvatarImageError, AvatarImageHandlers, AvatarImageLoad, AvatarImageSource } from './types.js'

/** What AvatarImage reads: its img, whether that img failed, and the handlers that learn it. A failure
 * is kept with its src and srcSet; a new one starts again in the render that brings it, and a load clears it. */
export function useAvatarImage({ src, srcSet }: AvatarImageSource, { ref: forwarded, onError, onLoad }: AvatarImageHandlers) {
  const image = useRef(null as HTMLImageElement | null)
  const heard = useRef(false)
  const [state, setState] = useState({ src, srcSet, broken: false })
  if (!Object.is(state.src, src) || !Object.is(state.srcSet, srcSet)) setState({ src, srcSet, broken: false })
  const settle = useCallback((broken: boolean) => {
    setState((now) => (now.broken === broken && Object.is(now.src, src) && Object.is(now.srcSet, srcSet) ? now : { src, srcSet, broken }))
  }, [src, srcSet])

  // Stable while the caller's ref is, so a callback ref is called once per node, not on every render.
  const ref = useCallback((node: HTMLImageElement | null) => {
    image.current = node
    const done = typeof forwarded === 'function' ? forwarded(node) : undefined
    if (forwarded && typeof forwarded === 'object') forwarded.current = node
    return () => {
      image.current = null
      if (typeof done === 'function') done()
      else if (typeof forwarded === 'function') forwarded(null)
      else if (forwarded) forwarded.current = null
    }
  }, [forwarded])

  // An image that failed before the script ran fired its error event at no listener: fire it again.
  useEffect(() => {
    const node = image.current
    if (!node?.complete || node.naturalWidth > 0) return
    const source = [node.getAttribute('src'), node.getAttribute('srcset')].join(' ')
    // decode() rejects only a broken image, so one that reads 0 wide for any other reason stays.
    node.decode().catch(() => {
      const same = [node.getAttribute('src'), node.getAttribute('srcset')].join(' ') === source
      if (same && !heard.current) node.dispatchEvent(new Event('error'))
    })
  }, [])

  const handleError = useCallback((event: AvatarImageError) => {
    heard.current = true
    settle(true)
    onError?.(event)
  }, [settle, onError])

  const handleLoad = useCallback((event: AvatarImageLoad) => {
    settle(false)
    onLoad?.(event)
  }, [settle, onLoad])

  return { ref, failed: state.broken, onError: handleError, onLoad: handleLoad }
}
