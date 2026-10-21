'use client'

// The palette (S5): the library's Command over the locale's index, fetched on the first open; a choice navigates.
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Command } from 'topclassui/command'
import { TopClassProvider } from 'topclassui/provider'
import { Spinner } from 'topclassui/spinner'
import { Svg } from 'topclassui/svg'
import { fileText } from 'topclassui/icons/file-text'
import { magnifyingGlass } from 'topclassui/icons/magnifying-glass'

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
            <Svg icon={fileText} size="0.875rem" aria-hidden="true" className="shrink-0 text-muted in-data-highlighted:text-primary-on-soft" />
            <span className="min-w-0 flex-1 truncate">{entry.title}</span>
            {entry.hint === null ? null : <bdi dir="ltr" className="shrink-0 font-mono text-xs text-muted in-data-highlighted:hidden">{entry.hint}</bdi>}
          </>
        )}
        emptyFallback={(
          <span className="flex flex-col items-center gap-1.5">
            <Svg icon={magnifyingGlass} size="1.125rem" aria-hidden="true" />
            <span className="font-mono text-xs">{t.empty}</span>
          </span>
        )}
        loadingFallback={(
          <span className="flex flex-col items-center gap-1.5">
            <Spinner size="sm" aria-hidden="true" />
            <span className="font-mono text-xs">{t.loading}</span>
          </span>
        )}
        onSelect={(entry) => { router.push(entry.href) }}
        open={open}
        onOpenChange={onOpenChange}
        shortcut={null}
      />
    </TopClassProvider>
  )
}
