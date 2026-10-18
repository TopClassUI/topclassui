'use client'

import { useEffect, useId, useRef } from 'react'

import { restoreFocus } from '#shared/focus-neighbour.js'
import { useLabels } from '#shared/provider/context.js'
import { neighbourOf } from './lib.js'
import type { TagRemoveEvent } from './types.js'

/** The two ids the x is named by, the word for remove in the provider's language, and what the x does. An x that
 * held the focus hands it on once its tag leaves the page (R-5.6-1); the caller's own effects run after, so its focus wins. */
export function useTagRemovable(onRemove: () => void) {
  const id = useId()
  const labelId = useId()
  const next = useRef({ to: null as HTMLElement | null, visible: false })
  useEffect(() => {
    const leaving = next
    return () => { restoreFocus(leaving.current.to, leaving.current.visible) }
  }, [])
  return {
    id,
    labelId,
    label: useLabels().tag.remove,
    remove: (event: TagRemoveEvent) => {
      const x = event.currentTarget
      if (x === x.ownerDocument.activeElement) next.current = { to: neighbourOf(x), visible: x.matches(':focus-visible') }
      onRemove()
    },
  }
}
