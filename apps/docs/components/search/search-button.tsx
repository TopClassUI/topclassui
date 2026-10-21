'use client'

// The search button (S5): it and Ctrl K or Cmd K open the palette, whose code and index load on the first open only.
import { Suspense, lazy, useEffect, useState, useSyncExternalStore } from 'react'
import { Button } from 'topclassui/button'
import { Svg } from 'topclassui/svg'
import { magnifyingGlass } from 'topclassui/icons/magnifying-glass'

import type { SearchLabels } from '../../labels/types'
import type { Locale } from '../../lib/locales'
import { SEARCH_TRIGGER } from '../classes'

const SearchPalette = lazy(() => import('./search-palette'))

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)
const never = () => () => undefined

/** True for Ctrl K or Cmd K; the code too, so it works under an Arabic layout. */
export function isSearchShortcut(event: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && (event.key.toLowerCase() === 'k' || event.code === 'KeyK')
}

export function SearchButton({ locale, labels: t }: { locale: Locale; labels: SearchLabels }) {
  const [open, setOpen] = useState(false)
  const [opened, setOpened] = useState(false)
  // Read after mount: the server and the first paint say Ctrl K.
  const mac = useSyncExternalStore(never, isMac, () => false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return
      // Captured on window, so a Command demo on the page, listening on document, does not open beside the search.
      event.preventDefault()
      event.stopPropagation()
      setOpened(true)
      setOpen(true)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => { window.removeEventListener('keydown', onKey, { capture: true }) }
  }, [])

  return (
    <>
      <Button variant="outline" tone="neutral" size="sm" className={SEARCH_TRIGGER} aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'} data-search-button="" onClick={() => { setOpened(true); setOpen(true) }}>
        <Svg icon={magnifyingGlass} size="1rem" aria-hidden="true" />
        <span className="max-md:sr-only">{t.button}</span>
        <kbd aria-hidden="true" dir="ltr" className="font-mono text-xs text-muted max-md:hidden">{mac ? t.shortcut.mac : t.shortcut.pc}</kbd>
      </Button>
      {opened ? (
        <Suspense fallback={null}>
          <SearchPalette locale={locale} labels={t} open={open} onOpenChange={setOpen} />
        </Suspense>
      ) : null}
    </>
  )
}
