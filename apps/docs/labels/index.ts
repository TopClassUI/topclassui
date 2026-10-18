import type { Locale } from '../content/pages'
import { ar } from './ar'
import { en } from './en'
import type { SiteLabels } from './types'

export type { Mode, Rendering, SiteLabels } from './types'

const BY_LOCALE: Record<Locale, SiteLabels> = { en, ar }

export function labelsFor(locale: Locale): SiteLabels {
  return BY_LOCALE[locale]
}

export const DIRECTION = { en: 'ltr', ar: 'rtl' } as const satisfies Record<Locale, 'ltr' | 'rtl'>

/** Each language named in its own script, the same in both locales. */
export const LANGUAGE_NAMES = { en: 'English', ar: 'العربية' } as const satisfies Record<Locale, string>
