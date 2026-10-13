'use client'

import { createContext, useContext } from 'react'

import { COLLECTION_DEFAULTS, type CollectionDefaults } from '../contracts/collection.js'
import { resolveToastSettings, type ToastSettings } from '../contracts/toast.js'
import { en } from '../labels/en.js'
import { createNumberFormat, type NumberingSystem } from '../labels/get-labels.js'
import type { Labels } from '../labels/types.js'
import { DEFAULT_ADAPTIVE_QUERY } from '../adaptive/use-adaptive-mode.js'

export type Direction = 'ltr' | 'rtl'

export interface TopClassContextValue {
  direction: Direction
  locale: string
  labels: Labels
  numberingSystem: NumberingSystem
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

function useTopClass(): TopClassContextValue {
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
