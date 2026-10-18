import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { LIVE_GUIDES, LOCALES } from '../content/pages.js'
import { checkedSamples, compileSamples, programsOf, samplesOf } from './lib/samples.js'

const APP = resolve(import.meta.dirname, '..')

describe('checkedSamples', () => {
  it('takes only the fences marked check', () => {
    const mdx = '```tsx title="a.tsx" check\nconst a = 1\n```\n\n```tsx title="check.tsx"\nconst b = 2\n```\n'
    expect(checkedSamples('en/x.mdx', mdx)).toEqual([{ file: 'en/x.mdx', index: 0, lang: 'tsx', title: 'a.tsx', code: 'const a = 1\n' }])
  })
})

describe('the live guide pages', () => {
  const samples = samplesOf(resolve(APP, 'content'), LIVE_GUIDES.map((page) => page.slug), LOCALES)

  it('hold thirty samples marked check: six on the getting-started pages and nine on the foundation pages, in each locale', () => {
    expect(samples.map((sample) => `${sample.file} ${sample.title ?? ''}`)).toEqual([
      'en/installation.mdx src/icons.ts',
      'en/provider.mdx app/[locale]/layout.tsx',
      'en/first-component.mdx app/subscribe/actions.ts',
      'en/first-component.mdx app/subscribe/page.tsx',
      'en/first-component.mdx app/subscribe/subscribe-form.tsx',
      'en/first-component.mdx app/subscribe/page.tsx',
      'en/icons.mdx ',
      'en/icons.mdx my-logo.tsx',
      'en/theming.mdx ',
      'en/rtl.mdx app/layout.tsx',
      'en/rtl.mdx ',
      'en/server-first.mdx ',
      'en/accessibility.mdx save-button.tsx',
      'en/accessibility.mdx home-link.tsx',
      'en/accessibility.mdx ',
      'ar/installation.mdx src/icons.ts',
      'ar/provider.mdx app/[locale]/layout.tsx',
      'ar/first-component.mdx app/subscribe/actions.ts',
      'ar/first-component.mdx app/subscribe/page.tsx',
      'ar/first-component.mdx app/subscribe/subscribe-form.tsx',
      'ar/first-component.mdx app/subscribe/page.tsx',
      'ar/icons.mdx ',
      'ar/icons.mdx my-logo.tsx',
      'ar/theming.mdx ',
      'ar/rtl.mdx app/layout.tsx',
      'ar/rtl.mdx ',
      'ar/server-first.mdx ',
      'ar/accessibility.mdx save-button.tsx',
      'ar/accessibility.mdx home-link.tsx',
      'ar/accessibility.mdx ',
    ])
  })

  it('compile every sample marked check against the package', () => {
    expect(compileSamples(APP, samples)).toEqual([])
  })

  it('compile the step 2 page.tsx too, which step 4 replaces under the same title', () => {
    expect(programsOf(APP, samples)).toHaveLength(3)
  })

  it('fail an earlier sample that a later one of the same title would hide', () => {
    const page = (index: number, code: string) => ({ file: 'en/two.mdx', index, lang: 'tsx', title: 'page.tsx', code })
    expect(compileSamples(APP, [page(0, 'export const x: number = "one"\n'), page(1, 'export const x: number = 1\n')]).length).toBeGreaterThan(0)
  })

  it('fail a sample that does not compile', () => {
    const bad = [{ file: 'en/bad.mdx', index: 0, lang: 'ts', title: null, code: "import { Nope } from 'topclassui/button'\nexport const x: number = Nope\n" }]
    expect(compileSamples(APP, bad).length).toBeGreaterThan(0)
  })
})
