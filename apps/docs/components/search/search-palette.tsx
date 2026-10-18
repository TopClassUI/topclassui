'use client'

// The palette (S5): the library's Command over the locale's index, fetched on the first open; a choice navigates.
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Command } from 'topclassui/command'
import { TopClassProvider } from 'topclassui/provider'

import type { SearchLabels } from '../../labels/types'
import { DIRECTION, type Locale } from '../../lib/locales'
import type { SearchEntry } from '../../scripts/lib/search'

export interface SearchPaletteProps {
  locale: Locale
  labels: SearchLabels
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SearchPalette({ locale, labels: t, open, onOpenChange }: SearchPaletteProps) {
  const router = useRouter()
  const [items, setItems] = useState<SearchEntry[] | null>(null)
  const labels = useMemo(() => ({ command: { label: t.title, placeholder: t.placeholder } }), [t])

  useEffect(() => {
    let live = true
    void fetch(`/search/${locale}.json`).then((response) => response.json() as Promise<SearchEntry[]>).then((entries) => { if (live) setItems(entries) })
    return () => { live = false }
  }, [locale])

  return (
    <TopClassProvider direction={DIRECTION[locale]} locale={locale} labels={labels}>
      <Command
        items={items ?? []}
        status={items === null ? 'loading' : 'idle'}
        getKey={(entry) => `${entry.group} ${entry.label}`}
        getLabel={(entry) => entry.label}
        getGroup={(entry) => t.groups[entry.group]}
        renderItem={(entry) => (
          <>
            <span className="min-w-0 flex-1 truncate">{entry.title}</span>
            {entry.hint === null ? null : <bdi dir="ltr" className="shrink-0 font-mono text-xs text-muted">{entry.hint}</bdi>}
          </>
        )}
        onSelect={(entry) => { router.push(entry.href) }}
        open={open}
        onOpenChange={onOpenChange}
        shortcut={null}
      />
    </TopClassProvider>
  )
}
