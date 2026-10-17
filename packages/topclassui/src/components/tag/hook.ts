'use client'

import { useId } from 'react'

import { useLabels } from '#shared/provider/context.js'

/** The two ids the x is named by, its own and its label's, and the word for remove in the
 * language of the provider: English when none is mounted. */
export function useTagRemovable() {
  const id = useId()
  const labelId = useId()
  return { id, labelId, label: useLabels().tag.remove }
}
