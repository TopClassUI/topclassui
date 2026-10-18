'use client'

import { useState } from 'react'

import type { IconFact } from '../../lib/guide-facts'

export const ICON_FILTERS = ['all', 'directional', 'solid'] as const
export type IconFilter = (typeof ICON_FILTERS)[number]

function isFilter(value: string): value is IconFilter {
  return (ICON_FILTERS as readonly string[]).includes(value)
}

/** Whether a tile stays shown: its name holds the query, and it is of the kind the filter asks for. */
export function matches(icon: IconFact, query: string, filter: IconFilter): boolean {
  if (filter === 'directional' && !icon.directional) return false
  if (filter === 'solid' && !icon.solid) return false
  return icon.name.includes(query.trim().toLowerCase())
}

/** The search box, the filter and the copy of the Icons grid; it hides tiles and never fetches (docs-site page 8). */
export function useIconFinder(icons: readonly IconFact[], announce: { copied: (code: string) => string; failed: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<IconFilter>('all')
  const [message, setMessage] = useState<string | null>(null)
  const shown = new Set(icons.filter((icon) => matches(icon, query, filter)).map((icon) => icon.name))

  const copy = (name: string) => {
    const code = `<Icon name="${name}" />`
    navigator.clipboard.writeText(code).then(
      () => { setMessage(announce.copied(code)) },
      () => { setMessage(announce.failed) },
    )
  }

  return {
    query,
    filter,
    shown,
    message,
    search: (value: string) => { setQuery(value); setMessage(null) },
    pick: (value: string) => { if (isFilter(value)) { setFilter(value); setMessage(null) } },
    copy,
  }
}
