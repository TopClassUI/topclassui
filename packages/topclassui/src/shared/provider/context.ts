'use client'

import { createContext, useContext, useEffect } from 'react'

import { COLLECTION_DEFAULTS, type CollectionDefaults } from '../contracts/collection.js'
import { resolveToastSettings, type ToastSettings } from '../contracts/toast.js'
import { en } from '../labels/en.js'
import { createNumberFormat } from '../labels/get-labels.js'
import type { Labels } from '../labels/types.js'
import { DEFAULT_ADAPTIVE_QUERY } from '../adaptive/use-adaptive-mode.js'

export type Direction = 'ltr' | 'rtl'

export interface TopClassContextValue {
  direction: Direction
  locale: string
  labels: Labels
  /** The digits numberFormat writes: the provider's own, or the locale tag's. */
  numberingSystem: string
  numberFormat: Intl.NumberFormat
  adaptive: { query: string }
  collection: CollectionDefaults
}

/** The defaults a client component sees when nobody mounted a provider. */
export const FALLBACK_CONTEXT: TopClassContextValue = {
  direction: 'ltr',
  locale: 'en',
  labels: en,
  numberingSystem: 'latn',
  numberFormat: createNumberFormat('en', 'latn'),
  adaptive: { query: DEFAULT_ADAPTIVE_QUERY },
  collection: COLLECTION_DEFAULTS,
}

export const TopClassContext = createContext<TopClassContextValue | null>(null)

/** Set by the outermost provider only, so a nested one reads the settings the one Toast.Provider runs on. */
export const ToastSettingsContext = createContext<ToastSettings>(resolveToastSettings())

type Warning = 'direction' | 'locale' | 'provider' | 'mismatch'
const warned = new Set<Warning>()

/** R-13-1: one development warning naming the kinds this page has not been warned about yet. Call it from an effect. */
export function warnOnce<K extends Warning>(kinds: readonly K[], message: (fresh: K[]) => string): void {
  if (process.env.NODE_ENV === 'production') return
  const fresh = kinds.filter((kind) => !warned.has(kind))
  if (fresh.length === 0) return
  for (const kind of fresh) warned.add(kind)
  console.warn(`[topclassui] ${message(fresh)}`)
}

/** R-13-1: a component with no provider above it warns once per page, in development, from an effect. */
export function useProviderPresence(): void {
  const provided = useContext(TopClassContext) !== null
  useEffect(() => {
    if (provided) return
    warnOnce(['provider'], () => (
      `A component rendered with no <TopClassProvider> above it, so it runs on direction="${FALLBACK_CONTEXT.direction}" `
      + `locale="${FALLBACK_CONTEXT.locale}".\n`
      + '  Mount one in the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>'
    ))
  }, [provided])
}

function useTopClass(): TopClassContextValue {
  useProviderPresence()
  return useContext(TopClassContext) ?? FALLBACK_CONTEXT
}

export function useDirection(): Direction {
  return useTopClass().direction
}

export function useLocale(): string {
  return useTopClass().locale
}

export function useLabels(): Labels {
  return useTopClass().labels
}

export function useNumberFormat(): Intl.NumberFormat {
  return useTopClass().numberFormat
}

export function useCollectionDefaults(): CollectionDefaults {
  return useTopClass().collection
}

/** Where the toasts sit, how many show and how long one stays, after the clamp. */
export function useToastSettings(): ToastSettings {
  return useContext(ToastSettingsContext)
}
