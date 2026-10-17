'use client'

import { useEffect } from 'react'

import { type Direction, FALLBACK_CONTEXT } from './context.js'

const warned = new Set<'direction' | 'locale'>()

/** R-13-1: the direction and locale the provider runs on, the fallback's when the layout left one out,
 * and a warning once per page in development. In an effect, so a server render never warns. */
export function useProviderLocale(
  direction: Direction | undefined,
  locale: string | undefined,
): { direction: Direction, locale: string } {
  const validDirection = direction === 'ltr' || direction === 'rtl'
  const validLocale = typeof locale === 'string' && locale !== ''

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const missing = [
      ...(validDirection ? [] : ['direction' as const]),
      ...(validLocale ? [] : ['locale' as const]),
    ].filter((prop) => !warned.has(prop))
    if (missing.length === 0) return
    for (const prop of missing) warned.add(prop)
    console.warn(
      `[topclassui] <TopClassProvider> has no valid ${missing.join(' or ')}, so it falls back to `
      + `direction="${FALLBACK_CONTEXT.direction}" locale="${FALLBACK_CONTEXT.locale}".\n`
      + '  Pass both from the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>',
    )
  }, [validDirection, validLocale])

  return {
    direction: validDirection ? direction : FALLBACK_CONTEXT.direction,
    locale: validLocale ? locale : FALLBACK_CONTEXT.locale,
  }
}
