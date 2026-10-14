'use client'

import { useLabels } from '#shared/provider/context.js'

/** The name of the x, in the language of the provider: English when none is mounted. */
export function useTagRemove() {
  return { label: useLabels().tag.remove }
}
