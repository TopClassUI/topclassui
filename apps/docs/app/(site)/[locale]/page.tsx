import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogChips } from '../../../components/home/catalog-chips'
import { FollowCards } from '../../../components/home/follow-cards'
import { Hero } from '../../../components/home/hero'
import { HomeSection } from '../../../components/home/home-section'
import { InstallCard } from '../../../components/home/install-card'
import { ModeCards } from '../../../components/home/mode-cards'
import { Numbers } from '../../../components/home/numbers'
import { ProductFrame } from '../../../components/home/product-frame'
import { Requirements } from '../../../components/home/requirements'
import { RtlPanel } from '../../../components/home/rtl-panel'
import { ServerPanel } from '../../../components/home/server-panel'
import { TestedPanel } from '../../../components/home/tested-panel'
import { JsonLd } from '../../../components/json-ld'
import { SitePage } from '../../../components/shell/site-page'
import { isLocale, pageBySlug, type Locale, type PageEntry } from '../../../content/pages'
import { labelsFor } from '../../../labels'
import { CARDS } from '../../../lib/data'
import { createMetadata } from '../../../lib/metadata'
import { organizationData, sourceCodeData, websiteData } from '../../../lib/structured-data'

type Params = Promise<{ locale: string }>

function homeOf(locale: string): { locale: Locale; entry: PageEntry } {
  const entry = pageBySlug('home')
  if (!isLocale(locale) || entry === undefined) notFound()
  return { locale, entry }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const home = homeOf((await params).locale)
  return createMetadata(home.entry, home.locale)
}

/** Home (docs-site page 1): no sidebar and no On this page; each section a `section` with an h2. */
export default async function Home({ params }: { params: Params }) {
  const { locale, entry } = homeOf((await params).locale)
  const labels = labelsFor(locale)
  const home = labels.home
  return (
    <SitePage locale={locale} current="home" path="">
      <JsonLd data={organizationData()} />
      <JsonLd data={websiteData(locale)} />
      <JsonLd data={sourceCodeData(entry, locale)} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-(--docs-home) overflow-x-clip px-4 pb-16 outline-none md:px-6 xl:px-0">
        <Hero locale={locale} labels={labels} />
        <div className="pt-16 pb-24">
          <ProductFrame locale={locale} labels={labels} />
        </div>
        <HomeSection id="proof" eyebrow={home.proof.eyebrow} title={home.proof.title} lead={home.proof.lead}>
          <div className="grid grid-cols-1 gap-5.5 lg:grid-cols-3">
            <ServerPanel locale={locale} labels={labels} />
            <RtlPanel labels={labels} />
            <TestedPanel labels={labels} />
          </div>
        </HomeSection>
        <HomeSection id="modes" eyebrow={home.modes.eyebrow} title={home.modes.title} lead={home.modes.lead}>
          <ModeCards labels={labels} />
        </HomeSection>
        <HomeSection id="numbers" eyebrow={home.numbers.eyebrow} title={home.numbers.title} lead={home.numbers.lead}>
          <Numbers labels={labels} />
        </HomeSection>
        <HomeSection id="catalog" eyebrow={home.catalog.eyebrow} title={home.catalog.title(CARDS.length)} lead={home.catalog.lead}>
          <CatalogChips locale={locale} labels={labels} />
        </HomeSection>
        <HomeSection id="follow" eyebrow={home.follow.eyebrow} title={home.follow.title} lead={home.follow.lead}>
          <FollowCards labels={labels} />
        </HomeSection>
        <HomeSection id="install" eyebrow={home.install.eyebrow} title={home.install.title} lead={home.install.lead}>
          <InstallCard locale={locale} labels={labels} />
        </HomeSection>
        <HomeSection id="need" eyebrow={home.need.eyebrow} title={home.need.title} lead={home.need.lead}>
          <Requirements labels={labels} />
        </HomeSection>
      </main>
    </SitePage>
  )
}
