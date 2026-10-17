import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { LIVE_GUIDES, LOCALES } from '../content/pages.js'
import { checkedSamples, compileSamples, samplesOf } from './lib/samples.js'

const APP = resolve(import.meta.dirname, '..')

describe('checkedSamples', () => {
  it('takes only the fences marked check', () => {
    const mdx = '```tsx title="a.tsx" check\nconst a = 1\n```\n\n```tsx title="check.tsx"\nconst b = 2\n```\n'
    expect(checkedSamples('en/x.mdx', mdx)).toEqual([{ file: 'en/x.mdx', index: 0, lang: 'tsx', title: 'a.tsx', code: 'const a = 1\n' }])
  })
})

describe('the live guide pages', () => {
  it('compile every sample marked check against the package', () => {
    const samples = samplesOf(resolve(APP, 'content'), LIVE_GUIDES.map((page) => page.slug), LOCALES)
    expect(compileSamples(APP, samples)).toEqual([])
  })

  it('fail a sample that does not compile', () => {
    const bad = [{ file: 'en/bad.mdx', index: 0, lang: 'ts', title: null, code: "import { Nope } from 'topclassui/button'\nexport const x: number = Nope\n" }]
    expect(compileSamples(APP, bad).length).toBeGreaterThan(0)
  })
})
