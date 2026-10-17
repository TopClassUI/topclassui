'use client'

import { useEffect, useRef } from 'react'

import { restoreFocus } from '#shared/focus-neighbour.js'
import { useLabels } from '#shared/provider/context.js'
import { neighbourOf } from './lib.js'
import type { TagRemoveEvent, TagRemoveProps } from './types.js'

/** The name of the x, in the language of the provider, and what it does. An x that held the focus hands it on
 * once its tag leaves the page (R-5.6-1); the caller's own effects run after, so a focus it moves wins. */
export function useTagRemove(onRemove: TagRemoveProps['onRemove']) {
  const next = useRef({ to: null as HTMLElement | null, visible: false })
  useEffect(() => {
    const leaving = next
    return () => { restoreFocus(leaving.current.to, leaving.current.visible) }
  }, [])
  return {
    label: useLabels().tag.remove,
    remove: (event: TagRemoveEvent) => {
      const x = event.currentTarget
      if (x === x.ownerDocument.activeElement) next.current = { to: neighbourOf(x), visible: x.matches(':focus-visible') }
      onRemove()
    },
  }
}
