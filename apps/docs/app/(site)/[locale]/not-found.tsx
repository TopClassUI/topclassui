import type { Metadata } from 'next'
import Link from 'next/link'
import { locale as localeParam } from 'next/root-params'
import { Button } from 'topclassui/button'

import { SitePage } from '../../../components/shell/site-page'
import { hrefOf, isLocale, pageBySlug } from '../../../content/pages'
import { labelsFor } from '../../../labels/index'

export const metadata: Metadata = { robots: { index: false } }

/** A notFound() inside a locale, such as /en/docs/nope (docs-site page 20); not-found gets no params, so the root param says which. */
export default async function NotFound() {
  const raw = await localeParam()
  const locale = isLocale(raw) ? raw : 'en'
  const labels = labelsFor(locale)
  const catalog = pageBySlug('components')
  return (
    <SitePage locale={locale} current="" path="">
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-(--docs-column) flex-1 flex-col items-start gap-4 px-4 py-16 outline-none">
        <title>{labels.meta.notFoundTitle}</title>
        <h1 className="text-4xl font-semibold text-body">{labels.notFound.title}</h1>
        <p className="text-base text-muted">{labels.notFound.lead}</p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href={`/${locale}`} />}>{labels.notFound.home}</Button>
          {catalog === undefined ? null : (
            <Button variant="outline" tone="neutral" render={<Link href={hrefOf(catalog, locale)} />}>{labels.notFound.components}</Button>
          )}
        </div>
      </main>
    </SitePage>
  )
}
