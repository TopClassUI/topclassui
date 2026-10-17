// The two locales; direction follows the locale, never a toggle (choice 4, R-13-1).
export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

export const DIRECTION = { en: 'ltr', ar: 'rtl' } as const satisfies Record<Locale, 'ltr' | 'rtl'>

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
