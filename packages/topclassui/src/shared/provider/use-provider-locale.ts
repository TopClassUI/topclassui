'use client'

import { useEffect } from 'react'

import { type Direction, FALLBACK_CONTEXT, warnOnce } from './context.js'

/** R-13-1: the direction and locale the provider runs on, the fallback's when the layout left one out,
 * and a warning once per page in development. In effects, so a server render never warns. */
export function useProviderLocale(
  direction: Direction | undefined,
  locale: string | undefined,
  nested: boolean,
): { direction: Direction, locale: string } {
  const validDirection = direction === 'ltr' || direction === 'rtl'
  const validLocale = typeof locale === 'string' && locale !== ''
  const resolved = validDirection ? direction : FALLBACK_CONTEXT.direction

  useEffect(() => {
    const missing = [
      ...(validDirection ? [] : ['direction' as const]),
      ...(validLocale ? [] : ['locale' as const]),
    ]
    warnOnce(missing, (fresh) => (
      `<TopClassProvider> has no valid ${fresh.join(' or ')}, so it falls back to `
      + `${fresh.map((prop) => `${prop}="${FALLBACK_CONTEXT[prop]}"`).join(' ')}.\n`
      + '  Pass both from the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>'
    ))
  }, [validDirection, validLocale])

  // The one read of the page's dir in src: a development check that never feeds the render.
  useEffect(() => {
    if (nested) return
    const page = document.documentElement.dir
    if (page === '' || page === resolved) return
    warnOnce(['mismatch'], () => (
      `<TopClassProvider direction="${resolved}"> disagrees with <html dir="${page}">.\n`
      + '  Pass the same direction to both from the root layout (R-13-1).'
    ))
  }, [nested, resolved])

  return {
    direction: resolved,
    locale: validLocale ? locale : FALLBACK_CONTEXT.locale,
  }
}
