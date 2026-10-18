import { describe, expect, it } from 'vitest'

import { FIXED_ENTRYPOINTS, SAMPLE_ENTRYPOINTS, componentSlugs, entrypoints } from './entrypoints.js'

describe('entrypoints', () => {
  it('lists the fixed subpaths, then the components sorted, then one sample of each pattern', () => {
    expect(entrypoints(['dialog', 'button'])).toEqual([
      './provider',
      './theme',
      './cn',
      './classes',
      './labels/en',
      './labels/ar',
      './labels/get-labels',
      './labels/types',
      './icons',
      './icons/check',
      './button',
      './dialog',
      './schemas/button',
      './meta/button',
    ])
  })

  it('names ten fixed subpaths and two samples', () => {
    expect(FIXED_ENTRYPOINTS).toHaveLength(10)
    expect(SAMPLE_ENTRYPOINTS).toEqual(['schemas/button', 'meta/button'])
  })

  it('reads the component folders that have an index.tsx, button and icon among them', () => {
    const slugs = componentSlugs(process.cwd())
    expect(slugs).toContain('button')
    expect(slugs).toContain('icon')
    expect(slugs).toContain('icon-registry')
    expect(slugs.length).toBeGreaterThanOrEqual(52)
    expect(slugs).toEqual([...slugs].sort())
  })
})
