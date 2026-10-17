import { describe, expect, it } from 'vitest'

import { demoMapSource, parseDemoMap, playgroundMapSource } from './demo-map.js'

const demos = [{ slug: 'button', name: 'variants' }, { slug: 'segmented-control', name: 'rtl' }]

describe('demoMapSource', () => {
  it('writes one literal import per demo into dist, and the keys in the same order', () => {
    expect(demoMapSource(demos)).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const DEMOS = {',
      "  'button/variants': () => import('../../../packages/topclassui/dist/components/button/dummy/variants.js'),",
      "  'segmented-control/rtl': () => import('../../../packages/topclassui/dist/components/segmented-control/dummy/rtl.js'),",
      '} as const',
      '',
      'export const DEMO_KEYS = [',
      "  'button/variants',",
      "  'segmented-control/rtl',",
      '] as const',
      '',
      'export type DemoKey = (typeof DEMO_KEYS)[number]',
      '',
    ].join('\n'))
  })

  it('writes an empty map for no demos', () => {
    expect(parseDemoMap(demoMapSource([]))).toEqual([])
  })
})

describe('parseDemoMap', () => {
  it('reads back every key and file it wrote', () => {
    expect(parseDemoMap(demoMapSource(demos))).toEqual([
      { key: 'button/variants', file: '../../../packages/topclassui/dist/components/button/dummy/variants.js' },
      { key: 'segmented-control/rtl', file: '../../../packages/topclassui/dist/components/segmented-control/dummy/rtl.js' },
    ])
  })
})

describe('playgroundMapSource', () => {
  it('writes one literal import per playground stage, keyed by slug', () => {
    expect(playgroundMapSource(['button', 'tag'])).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const PLAYGROUNDS = {',
      "  'button': () => import('../../../packages/topclassui/dist/components/button/dummy/playground.js'),",
      "  'tag': () => import('../../../packages/topclassui/dist/components/tag/dummy/playground.js'),",
      '} as const',
      '',
      'export type PlaygroundSlug = keyof typeof PLAYGROUNDS',
      '',
    ].join('\n'))
  })
})
