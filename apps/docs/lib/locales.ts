// The component pages' door to the shell's locales: the list lives in content/pages; direction follows the locale, never a toggle (choice 4, R-13-1).
import type { Locale } from '../content/pages'

export { LOCALES, isLocale, type Locale } from '../content/pages'

export const DIRECTION = { en: 'ltr', ar: 'rtl' } as const satisfies Record<Locale, 'ltr' | 'rtl'>
