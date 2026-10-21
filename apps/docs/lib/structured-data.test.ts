import { describe, expect, it } from 'vitest'

import { pageBySlug } from '../content/pages.js'
import { pagedComponentOf, pagedComponents } from './components.js'
import { catalogData, componentArticleData, guideArticleData, organizationData, sourceCodeData, websiteData } from './structured-data.js'

const DATE = '2026-10-19T16:29:47.000Z'

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('the registry has this page')
  return value
}

describe('the JSON-LD of each page type', () => {
  it('names the organization with its logo and its GitHub, npm, YouTube and X profiles', () => {
    expect(organizationData()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://topclassui.com/#organization',
      name: 'TopClass UI',
      url: 'https://topclassui.com',
      logo: { '@type': 'ImageObject', url: 'https://topclassui.com/icon-512.png', width: '512', height: '512' },
      sameAs: ['https://github.com/TopClassUI/topclassui', 'https://www.npmjs.com/package/topclassui', 'https://www.youtube.com/@topclassui', 'https://x.com/topclassui'],
    })
  })

  it('writes one WebSite per locale, in that language, published by the organization', () => {
    expect(websiteData('ar')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://topclassui.com/ar#website',
      name: 'TopClass UI',
      url: 'https://topclassui.com/ar',
      inLanguage: 'ar',
      publisher: { '@id': 'https://topclassui.com/#organization' },
    })
  })

  it('keeps Home\'s SoftwareSourceCode, with the repository and the meta description', () => {
    const code = sourceCodeData(required(pageBySlug('home')), 'en')
    expect(code).toMatchObject({ '@type': 'SoftwareSourceCode', url: 'https://topclassui.com/en', codeRepository: 'https://github.com/TopClassUI/topclassui', programmingLanguage: 'TypeScript' })
  })

  it('describes a component page as a TechArticle with its language, its date and its card', () => {
    expect(componentArticleData(required(pagedComponentOf('breadcrumb')), 'ar', DATE)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'مسار التنقل',
      description: 'موقع الصفحة في الموقع، بروابط حقيقية ودون JavaScript. والمسار نفسه يُكتب BreadcrumbList بصيغة JSON-LD. مكوّن React لـ Next.js، بالعربية والإنجليزية.',
      inLanguage: 'ar',
      url: 'https://topclassui.com/ar/docs/components/breadcrumb',
      mainEntityOfPage: 'https://topclassui.com/ar/docs/components/breadcrumb',
      image: 'https://topclassui.com/ar/docs/components/breadcrumb/opengraph-image-5tbf0g',
      dateModified: DATE,
      publisher: { '@type': 'Organization', '@id': 'https://topclassui.com/#organization', name: 'TopClass UI', logo: 'https://topclassui.com/icon-512.png' },
      isPartOf: { '@id': 'https://topclassui.com/ar#website' },
    })
    expect(componentArticleData(required(pagedComponentOf('button')), 'en', null)).not.toHaveProperty('dateModified')
  })

  it('gives a guide the component article\'s fields and more: author, section, prerequisites and subject', () => {
    const guide = guideArticleData(required(pageBySlug('css')), 'en', DATE)
    expect(guide).toMatchObject({
      '@type': 'TechArticle',
      headline: 'CSS entry',
      inLanguage: 'en',
      url: 'https://topclassui.com/en/docs/css',
      image: 'https://topclassui.com/en/docs/css/opengraph-image-ccc11p',
      dateModified: DATE,
      author: { '@id': 'https://topclassui.com/#organization' },
      articleSection: 'Start here',
      dependencies: 'React 19+, Tailwind CSS 4.2+, Next.js 15+',
      about: { '@type': 'SoftwareSourceCode', name: 'TopClass UI', codeRepository: 'https://github.com/TopClassUI/topclassui' },
    })
    const changelog = guideArticleData(required(pageBySlug('changelog')), 'ar', null)
    expect(changelog).toMatchObject({ headline: 'سجل التغييرات', image: 'https://topclassui.com/ar/changelog/opengraph-image-1ejob3' })
  })

  it('lists every component page on the catalog, in order, as an ItemList', () => {
    const data = catalogData(required(pageBySlug('components')), 'en', pagedComponents().slice(0, 2))
    expect(data).toMatchObject({
      '@type': 'CollectionPage',
      url: 'https://topclassui.com/en/docs/components',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: 2,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accordion', url: 'https://topclassui.com/en/docs/components/accordion' },
          { '@type': 'ListItem', position: 2, name: 'Alert', url: 'https://topclassui.com/en/docs/components/alert' },
        ],
      },
    })
  })
})
